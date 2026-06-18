# 05b — Contrato de API · Sprint 2 (Pedidos, Tablero, Roles/Permisos)

> Complemento del doc [05 — Diseño de la API REST](05_api_design.md), afinado para el Sprint 2.
> Objetivo: cerrar el JSON exacto **antes de codear** y mantener los mocks MSW del front fieles al backend real.
> Alineado al esquema desplegado en Supabase (`setup_supabase.sql`) y al sobre `ApiResponse`.

---

## Convenciones (fijas)

- Base: `/api/v1` · JSON **snake_case** · `Authorization: Bearer <token>`
- Éxito: `{ "success": true, "data": …, "message": "…" }`
- Error: `{ "success": false, "error": "…", "code": "CODE" }`
- Códigos: 200/201 OK, 400 inválido, 401 no auth, 403 sin permiso, 404 no existe, 409 conflicto
- Montos USD: número JSON con 2 decimales (`29.00`); el front los trata como `number`.

---

## Decisiones acordadas (resolvían huecos del doc 05)

1. **`estado` siempre como objeto anidado** `{ id, nombre, color }` (no string suelto), para kanban y filtros.
2. **`GET /pedidos?estado_id=`** filtra por id numérico, no por nombre.
3. **Permisos incluidos en el login** (y en `GET /auth/me`) para que el front pueda mostrar/ocultar módulos.
4. **Borrado con FK:** estado en uso no se borra (409); pedido borra sus productos en cascada.
5. **ADMIN = acceso total** implícito; `permisos` puede venir vacío para ADMIN.

---

## 1. Pedidos

### `GET /pedidos` — permiso `pedidos.ver`
Query: `?estado_id=&search=&page=0&size=20`
```json
{ "success": true, "data": {
  "content": [
    { "id": 1,
      "num_orden": "ORD-001234", "num_tracking": "TRK-001234",
      "titular": "Carlos Pérez", "whatsapp": "+51999999999",
      "valor_usd": 20.00, "costo_importacion_usd": 29.00,
      "tipo_envio": "almacen",
      "estado": { "id": 3, "nombre": "En aduana", "color": "#3C3489" },
      "creado_en": "2026-06-13T10:00:00" }
  ],
  "page": 0, "size": 20, "total_elements": 312, "total_pages": 16
}}
```

### `GET /pedidos/{id}` — permiso `pedidos.ver` (detalle completo)
```json
{ "success": true, "data": {
  "id": 1, "comunidad": "Comunidad Norte",
  "titular": "Carlos Pérez", "consignatario": "María Pérez",
  "num_orden": "ORD-001234", "num_tracking": "TRK-001234",
  "whatsapp": "+51999999999", "firma": "Carlos Pérez",
  "valor_usd": 20.00, "costo_importacion_usd": 29.00,
  "tipo_envio": "almacen",
  "estado": { "id": 3, "nombre": "En aduana", "color": "#3C3489" },
  "productos": [ { "id": 10, "cantidad": 1, "producto": "Audífonos Sony", "marca": "Sony" } ],
  "creado_por": { "id": 1, "nombre": "Joaquín" },
  "creado_en": "2026-06-13T10:00:00", "actualizado_en": null
}}
```

### `POST /pedidos` — permiso `pedidos.editar` → 201
Campos obligatorios (NOT NULL): `titular`, `num_orden`, `num_tracking`, `whatsapp`, `costo_importacion_usd`.
`estado_id` opcional (si falta, el back asigna el estado de menor `orden`).
```json
{ "comunidad": "Comunidad Norte", "titular": "Carlos Pérez",
  "consignatario": "María Pérez", "num_orden": "ORD-001234",
  "num_tracking": "TRK-001234", "whatsapp": "+51999999999", "firma": "Carlos Pérez",
  "valor_usd": 20.00, "costo_importacion_usd": 29.00,
  "tipo_envio": "almacen", "estado_id": 1,
  "productos": [ { "cantidad": 1, "producto": "Audífonos Sony", "marca": "Sony" } ] }
```
Respuesta: el pedido creado (mismo shape que `GET /{id}`).
Errores: `num_orden`/`num_tracking` repetidos → 409 `DUPLICADO`; `tipo_envio` fuera de `almacen|lima|shalom` → 400 `VALIDATION`.

### `PUT /pedidos/{id}` — permiso `pedidos.editar`
Mismo body que POST (reemplaza datos + reemplaza la lista de `productos`). Devuelve el pedido actualizado.

### `PATCH /pedidos/{id}/estado` — permiso `tablero.editar` (mover en kanban)
```json
{ "estado_id": 3 }
```

### `DELETE /pedidos/{id}` — permiso `pedidos.editar` → 200
Borra el pedido y sus `productos` (FK `ON DELETE CASCADE`).
```json
{ "success": true, "message": "Pedido eliminado" }
```

---

## 2. Estados / Tablero

### `GET /estados` — protegido
```json
{ "success": true, "data": [
  { "id": 1, "nombre": "Recibido", "orden": 1, "color": "#0C447C" },
  { "id": 2, "nombre": "En tránsito", "orden": 2, "color": "#854F0B" }
]}
```

### `POST /estados` — permiso `tablero.editar` → 201
```json
{ "nombre": "En revisión", "orden": 3, "color": "#7F77DD" }
```

### `PUT /estados/{id}` · `DELETE /estados/{id}` — permiso `tablero.editar`
- DELETE de un estado con pedidos asignados → 409 `ESTADO_EN_USO`
  ("Reasigná los pedidos antes de eliminar").

### `GET /tablero` — protegido (kanban completo en una llamada)
```json
{ "success": true, "data": [
  { "id": 1, "nombre": "Recibido", "color": "#0C447C", "pedidos": [
      { "id": 1, "num_orden": "ORD-001234", "titular": "Carlos Pérez", "costo_importacion_usd": 29.00 }
  ]},
  { "id": 2, "nombre": "En tránsito", "color": "#854F0B", "pedidos": [] }
]}
```

---

## 3. Usuarios / Roles / Permisos (solo ADMIN)

> "Roles" = campo `rol` (`ADMIN`|`EMPLEADO`, CHECK en BD) + filas de `permisos` por módulo
> (solo aplican a EMPLEADO; ADMIN tiene todo implícito).
> Módulos válidos: `pedidos | tablero | finanzas | cotizador | configuracion`.

### Permisos en el login — `POST /auth/login` y `GET /auth/me`
```json
{ "success": true, "data": {
  "token": "eyJ…",
  "usuario": {
    "id": 2, "nombre": "María García", "email": "maria@orionlogistic.com",
    "rol": "EMPLEADO", "avatar_color": "#1B2A5E", "password_temporal": false,
    "permisos": [
      { "modulo": "pedidos", "puede_ver": true, "puede_editar": true },
      { "modulo": "tablero", "puede_ver": true, "puede_editar": false },
      { "modulo": "finanzas", "puede_ver": false, "puede_editar": false },
      { "modulo": "cotizador", "puede_ver": true, "puede_editar": false },
      { "modulo": "configuracion", "puede_ver": false, "puede_editar": false }
    ]
  }
}}
```
Para ADMIN, `permisos` viene vacío y el front asume acceso total.

### `GET /usuarios`
```json
{ "success": true, "data": [
  { "id": 1, "nombre": "Joaquín", "email": "joaquin@orionlogistic.com",
    "rol": "ADMIN", "avatar_color": "#D4AF37", "activo": true }
]}
```

### `POST /usuarios` → 201
```json
{ "nombre": "María García", "email": "maria@orionlogistic.com",
  "rol": "EMPLEADO", "password_temporal": "temp123", "avatar_color": "#1B2A5E" }
```
Crea el usuario con `password_temporal=true`. Devuelve el usuario (sin hash).

### `PUT /usuarios/{id}/permisos`
```json
{ "permisos": [
  { "modulo": "pedidos", "puede_ver": true, "puede_editar": true },
  { "modulo": "tablero", "puede_ver": true, "puede_editar": true },
  { "modulo": "finanzas", "puede_ver": false, "puede_editar": false },
  { "modulo": "cotizador", "puede_ver": true, "puede_editar": false },
  { "modulo": "configuracion", "puede_ver": false, "puede_editar": false }
]}
```

### `PATCH /usuarios/{id}/estado` (activar/desactivar)
```json
{ "activo": false }
```

---

## Errores que el front debe contemplar

| Caso | HTTP | code |
|---|---|---|
| Campo inválido / falta requerido | 400 | `VALIDATION` |
| `num_orden`/`num_tracking` duplicado | 409 | `DUPLICADO` |
| Estado con pedidos al borrar | 409 | `ESTADO_EN_USO` |
| Logueado pero sin permiso del módulo | 403 | `SIN_PERMISO` |
| Recurso inexistente | 404 | `NO_ENCONTRADO` |

> Nota front: el interceptor de axios (`src/lib/api.ts`) hoy solo trata el 401 → agregar manejo del 403 en Sprint 2.

---

*Complemento de [05 — API](05_api_design.md). Sujeto a ajuste al integrar.*
