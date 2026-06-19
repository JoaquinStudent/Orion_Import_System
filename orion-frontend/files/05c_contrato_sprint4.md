# 05c — Contrato de API · Sprint 4 (Comunidades, Estado de pago, Rastreo, Dashboard/Finanzas, Errores)

> Complemento de [05](05_api_design.md) y [05b](05b_contrato_sprint2.md), afinado para el Sprint 4.
> Recoge lo que ya está vivo en el backend + las adiciones de la fase de hardening/cierre.
> Mismas convenciones que 05b: base `/api/v1`, JSON **snake_case**, sobre `ApiResponse`
> (`{success,data,message}` / `{success,error,code}`), `Authorization: Bearer <token>`.

---

## 0. Cambios de contrato de ERRORES (hardening — afectan a TODOS los endpoints)

Estos cambios son backend-only pero el front debe tenerlos en cuenta:

| Situación | Antes | Ahora |
|---|---|---|
| Endpoint protegido sin token / token inválido | 403 "pelado" (sin envelope) | **401** `{success:false, error, code:"AUTH_INVALID"}` |
| Autenticado pero sin rol/permiso | 403 (variado) | **403** `{..., code:"SIN_PERMISO"}` (envelope) |
| `POST /auth/cambiar-password` con contraseña actual incorrecta | 401 | **400** `{..., code:"VALIDATION"}` (NO 401, para no desloguear) |
| Error inesperado del servidor | página de error de Spring | **500** `{..., code:"ERROR_INTERNO", error:"Error interno"}` (sin filtrar detalles) |
| `POST /usuarios` con `password_temporal` corta | min 6 | **min 8** → 400 `VALIDATION` |

> ⚠️ El interceptor del front desloguea ante 401/403 salvo `code:"SIN_PERMISO"`. Por eso "contraseña
> actual incorrecta" es 400 y no 401. No tratar un 400 de validación como sesión vencida.

---

## 1. Comunidades (catálogo del combobox)

### `GET /comunidades` — cualquier usuario autenticado
```json
{ "success": true, "data": [ { "id": 1, "nombre": "Comunidad Norte", "activo": true } ] }
```
### `POST /comunidades` · `PUT /comunidades/{id}` · `DELETE /comunidades/{id}` — permiso `configuracion.editar`
Request: `{ "nombre": "Comunidad Sur" }` (máx 100). Respuesta: la comunidad creada/editada en `data`.

---

## 2. Estado de pago de la importación

- Campo nuevo en pedidos: **`estado_pago`** ∈ `"pendiente" | "liquidado"` (default `pendiente`).
  Solo `liquidado` cuenta como ingreso en finanzas.
- Aparece en `GET /pedidos`, `GET /pedidos/{id}`.

### `PATCH /pedidos/{id}/pago` — permiso `pedidos.editar`
```json
// request
{ "estado_pago": "liquidado" }
// response: data = pedido (list item) actualizado
```

---

## 3. Tipo de envío

- Campo **`tipo_envio`** ∈ `"almacen" | "lima" | "shalom"` (nullable = sin asignar) en pedidos.
- En `POST/PUT /pedidos` se valida con ese enum (400 `VALIDATION` si no coincide).

### `PATCH /rastreo/tipo-envio` — público (rastreo del cliente)
```json
// request
{ "num_tracking": "TRK-001234", "num_orden": "ORD-001234", "tipo_envio": "lima" }
// response: data = RastreoResponse, message "Tipo de envío confirmado"
```

---

## 4. `GET /auth/me` — usuario autenticado (refresco de permisos)

Mismo shape que el `data.usuario` del login. El front debe llamarlo al entrar al panel
para refrescar permisos (hoy quedan stale hasta el próximo login).
```json
{ "success": true, "data": {
  "id": 2, "nombre": "José", "email": "jose@orionlogistic.com",
  "rol": "EMPLEADO", "avatar_color": "#1B2A5E", "password_temporal": false,
  "permisos": [ { "modulo": "pedidos", "puede_ver": true, "puede_editar": true } ]
}}
```
> ADMIN trae `permisos: []` (acceso total implícito).

---

## 5. `GET /dashboard/resumen` — permiso `pedidos.ver` (NUEVO)

Reemplaza el cómputo client-side de los KPIs del dashboard (antes derivados de una página
de 200 pedidos → incorrectos al superar ese tope).
```json
{ "success": true, "data": {
  "pedidos_hoy": 3,
  "en_transito": 5,
  "en_aduana": 2,
  "entregados_mes": 12,
  "ultimos": [
    { "id": 9, "num_orden": "ORD-009", "num_tracking": "TRK-009",
      "titular": "Ana Ruiz", "whatsapp": "+51...", "valor_usd": 20.00,
      "costo_importacion_usd": 29.00, "tipo_envio": "lima",
      "estado": { "id": 3, "nombre": "En aduana", "color": "#3C3489" },
      "estado_pago": "pendiente", "creado_en": "2026-06-18T10:00:00" }
  ]
}}
```
> Conteos `en_transito`/`en_aduana`/`entregados_mes` se basan en los **nombres** de estado
> semilla ("En tránsito"/"En aduana"/"Entregado"). Si se renombran esos estados en el CRUD,
> los conteos no coincidirán (limitación heredada del cálculo original del front).
> El card "Ingresos este mes" del dashboard sigue usando `GET /finanzas/resumen` (permiso `finanzas.ver`).

---

## 6. `GET /finanzas/kpis` — permiso `finanzas.ver` (NUEVO)

Reemplaza el cómputo client-side de las tarjetas KPI de finanzas. Ingresos = solo `liquidado`.
```json
{ "success": true, "data": {
  "ingreso_hoy_usd": 300.00,
  "ingreso_ayer_usd": 250.00,
  "ingreso_mes_usd": 4500.00,
  "pedidos_mes": 18,
  "ingreso_anio_usd": 51000.00,
  "mejor_mes": 6
}}
```
- `pedidos_mes`: TODOS los pedidos del mes (no solo liquidados).
- `mejor_mes`: número de mes **1–12** con mayor ingreso del año, o **null** si no hay ingresos.
  En el front: `MESES[mejor_mes - 1]` (su array es 0-indexed).
- El delta "vs ayer" lo calcula el front: `(ingreso_hoy_usd - ingreso_ayer_usd) / ingreso_ayer_usd`.

---

## 7. `GET /finanzas/resumen` — permiso `finanzas.ver` (EXTENDIDO, aditivo)

Query: `?periodo=dia|mes|anio&desde=YYYY-MM-DD&hasta=YYYY-MM-DD`.
Se agrega `desglose_tipo_envio` (los campos previos no cambian → backwards-compatible):
```json
{ "success": true, "data": {
  "ingreso_total_usd": 4500.00,
  "total_pedidos": 18,
  "serie": [ { "fecha": "2026-06-01", "ingreso_usd": 300.00 } ],
  "desglose_tipo_envio": [
    { "tipo_envio": "almacen", "cantidad": 4 },
    { "tipo_envio": "lima", "cantidad": 6 },
    { "tipo_envio": null, "cantidad": 2 }
  ]
}}
```
- `total_pedidos`: todos los del rango (= total del período en el panel del front).
- `ingreso_total_usd`: suma de **liquidados** del rango.
- `desglose_tipo_envio`: cuenta por tipo; `tipo_envio: null` = "sin asignar".
