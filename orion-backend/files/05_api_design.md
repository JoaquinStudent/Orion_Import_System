# 05 — Diseño de la API REST

> **SDD Orión Logistic** · Documento 5 de 9 · Versión 2.0
> Responsable: José (Backend)
> **Documento crítico para el trabajo en paralelo.** Joaquín consume estos endpoints; José los construye.

---

## 5.1 Convenciones generales

- **Base URL:** `https://api.orionlogisticperu.com/api/v1`
- **Formato:** JSON en peticiones y respuestas.
- **Autenticación:** header `Authorization: Bearer <token>` en endpoints protegidos.
- **Códigos:** 200 OK, 201 Creado, 400 Inválido, 401 No autenticado, 403 Sin permiso, 404 No encontrado, 500 Error.

**Respuesta estándar:**
```json
{ "success": true, "data": { }, "message": "Operación exitosa" }
```
**Error:**
```json
{ "success": false, "error": "Mensaje legible", "code": "ERROR_CODE" }
```

---

## 5.2 Autenticación

### POST `/auth/login` — Público
```json
// request
{ "email": "joaquin@orionlogistic.com", "password": "********" }
// response 200
{ "success": true, "data": {
    "token": "eyJhbGc...",
    "usuario": { "id": 1, "nombre": "Joaquín Rodríguez", "rol": "ADMIN", "password_temporal": false }
}}
```

### POST `/auth/cambiar-password` — Protegido
```json
{ "password_actual": "temp123", "password_nueva": "********" }
```

### POST `/auth/logout` — Protegido

---

## 5.3 Pedidos

### GET `/pedidos` — Protegido (permiso: pedidos.ver)
Query: `?estado=&page=0&size=20&search=`
```json
{ "success": true, "data": {
    "content": [
      { "id": 1, "num_tracking": "TRK-001234", "num_orden": "ORD-001234",
        "titular": "Carlos Pérez", "costo_importacion_usd": 29.00,
        "estado": "En tránsito", "whatsapp": "+51999999999",
        "creado_en": "2025-06-13T10:00:00" }
    ],
    "totalElements": 312, "totalPages": 16
}}
```

### GET `/pedidos/{id}` — Protegido

### POST `/pedidos` — Protegido (permiso: pedidos.editar)
```json
{
  "comunidad": "Comunidad Norte", "titular": "Carlos Pérez",
  "consignatario": "María Pérez", "num_orden": "ORD-001234",
  "num_tracking": "TRK-001234", "whatsapp": "+51999999999",
  "firma": "Carlos Pérez", "valor_usd": 20.00, "costo_importacion_usd": 29.00,
  "productos": [ { "cantidad": 1, "producto": "Audífonos Sony", "marca": "Sony" } ]
}
```

### PUT `/pedidos/{id}` — Protegido (permiso: pedidos.editar)

### PATCH `/pedidos/{id}/estado` — Protegido (permiso: tablero.editar)
```json
{ "estado_id": 3 }
```

---

## 5.4 Estados (Tablero)

### GET `/estados` — Protegido
### POST `/estados` — Protegido (permiso: tablero.editar)
```json
{ "nombre": "En revisión", "orden": 3, "color": "#7F77DD" }
```
### PUT `/estados/{id}` — Protegido
### DELETE `/estados/{id}` — Protegido

### GET `/tablero` — Protegido
```json
{ "success": true, "data": [
    { "estado": "Recibido", "color": "#0C447C", "pedidos": [ ] },
    { "estado": "En tránsito", "color": "#EF9F27", "pedidos": [ ] }
]}
```

---

## 5.5 Cotizador (simplificado)

### GET `/cotizador/config` — Público
Devuelve los valores que necesita el cotizador.
```json
{ "success": true, "data": {
    "flete_por_kilo": 10.00,
    "desaduanaje": 9.00,
    "umbral_asesor": 200,
    "whatsapp_atencion": "+51999999999"
}}
```

### POST `/cotizador/calcular` — Público
Calcula el costo de envío. Solo para valores menores a $200.
```json
// request
{ "valor_usd": 20.00, "peso_kg": 1.3 }
// response 200 (valor < 200)
{ "success": true, "data": {
    "aplica_calculo": true,
    "valor_usd": 20.00,
    "peso_real_kg": 1.3,
    "peso_cobrado_kg": 2,
    "flete_usd": 20.00,
    "desaduanaje_usd": 9.00,
    "total_usd": 29.00,
    "tipo_cambio": 3.40,
    "total_pen": 98.60
}}
// response 200 (valor > 200)
{ "success": true, "data": {
    "aplica_calculo": false,
    "mensaje": "Para envíos mayores a $200, contacta con un asesor",
    "whatsapp_atencion": "+51999999999"
}}
```

> **Lógica del cálculo (en el `CotizadorService`):**
> 1. Si `valor_usd > umbral_asesor` (200) → devolver `aplica_calculo: false`.
> 2. Redondear `peso_kg` hacia arriba: `peso_cobrado = Math.ceil(peso_kg)`.
> 3. `flete = peso_cobrado * flete_por_kilo`.
> 4. `total_usd = flete + desaduanaje`.
> 5. `total_pen = total_usd * tipo_cambio`.

### GET `/cotizador/tipo-cambio` — Público
```json
{ "success": true, "data": { "usd_pen": 3.40, "actualizado": "2025-06-13T09:00:00" } }
```

---

## 5.6 Configuración del cotizador (Admin)

### PUT `/admin/cotizador/config` — Protegido (permiso: cotizador.editar)
```json
{ "flete_por_kilo": 10.00, "desaduanaje": 9.00 }
```

---

## 5.7 Finanzas

### GET `/finanzas/resumen` — Protegido (permiso: finanzas.ver)
Query: `?periodo=mes&desde=2025-06-01&hasta=2025-06-30`
```json
{ "success": true, "data": {
    "ingreso_total_usd": 4280.00, "total_pedidos": 312,
    "serie": [
      { "fecha": "2025-06-01", "ingreso_usd": 145.00 },
      { "fecha": "2025-06-02", "ingreso_usd": 230.00 }
    ]
}}
```

### GET `/finanzas/exportar` — Protegido (permiso: finanzas.ver)
Devuelve un archivo `.xlsx`.

---

## 5.8 Usuarios y Roles (Admin)

### GET `/usuarios` — Protegido (solo ADMIN)
### POST `/usuarios` — Protegido (solo ADMIN)
```json
{ "nombre": "María García", "email": "maria@orionlogistic.com",
  "password_temporal": "temp123", "avatar_color": "#1B2A5E" }
```
### PUT `/usuarios/{id}/permisos` — Protegido (solo ADMIN)
```json
{ "permisos": [
    { "modulo": "pedidos", "puede_ver": true, "puede_editar": true },
    { "modulo": "tablero", "puede_ver": true, "puede_editar": true },
    { "modulo": "finanzas", "puede_ver": false, "puede_editar": false },
    { "modulo": "cotizador", "puede_ver": true, "puede_editar": false },
    { "modulo": "configuracion", "puede_ver": false, "puede_editar": false }
]}
```
### PATCH `/usuarios/{id}/estado` — Protegido (solo ADMIN)

---

## 5.9 Rastreo (Cliente)

### POST `/rastreo` — Público (valida tracking + orden juntos)
```json
// request
{ "num_tracking": "TRK-001234", "num_orden": "ORD-001234" }
// response 200
{ "success": true, "data": {
    "titular": "Carlos Pérez", "consignatario": "María Pérez",
    "comunidad": "Comunidad Norte",
    "productos": [ { "cantidad": 1, "producto": "Audífonos Sony", "marca": "Sony" } ],
    "estado_actual": "En aduana",
    "estados": [
      { "nombre": "Recibido", "completado": true },
      { "nombre": "En tránsito", "completado": true },
      { "nombre": "En aduana", "completado": false, "activo": true },
      { "nombre": "En almacén", "completado": false },
      { "nombre": "Entregado", "completado": false }
    ],
    "tipo_envio": null, "puede_elegir_envio": true
}}
```

### PATCH `/rastreo/tipo-envio` — Público (valida tracking + orden)
```json
{ "num_tracking": "TRK-001234", "num_orden": "ORD-001234", "tipo_envio": "almacen" }
```

---

## 5.10 Configuración general

### GET `/config/publica` — Público
```json
{ "success": true, "data": { "whatsapp_atencion": "+51999999999", "nombre_negocio": "Orión Logistic" } }
```
### PUT `/admin/config` — Protegido (solo ADMIN)

---

## 5.11 Resumen de endpoints por acceso

| Acceso | Endpoints |
|--------|-----------|
| **Público** | login, cotizador (config, calcular, tipo-cambio), rastreo, config pública |
| **Protegido (permiso)** | pedidos, estados, tablero, finanzas |
| **Solo ADMIN** | usuarios, permisos, configuración del cotizador, config general |

---

*Anterior: [04 — Base de datos](04_database.md) · Siguiente: [06 — Diseño de interfaces →](06_ui_design.md)*
