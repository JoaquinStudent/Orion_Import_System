# Mejoras de negocio — qué debe ajustar el backend (post-Sprint 4)

> Para José (back). El frontend ya implementó la parte de UI/UX de estas mejoras en la rama
> `frontend` (mock-first). Acá está **todo lo que el backend tiene que soportar** para que funcione
> contra el API real. Cada punto indica el contrato exacto que el front ya consume.
> Convención de errores/envelope: igual que `05c_contrato_sprint4.md` (`{ success, data, code? }`).

---

## 1. Tablero: agregar `num_tracking` y `estado_pago` a cada tarjeta

**Por qué:** el front ahora muestra el **tracking** como dato principal de la tarjeta y necesita el
`estado_pago` para aplicar la regla "no liquidado → no se puede entregar" (punto 3).

**Qué hacer:** en el DTO de la tarjeta del tablero (`GET /tablero`), agregar los dos campos:
```json
{ "id": 9, "num_orden": "ORD-009", "num_tracking": "TRK-009",
  "titular": "Ana Ruiz", "costo_importacion_usd": 29.0, "estado_pago": "pendiente" }
```
Hoy la tarjeta solo trae `id, num_orden, titular, costo_importacion_usd`.

---

## 2. Costo de importación opcional al crear

**Por qué:** la empresa normalmente carga el costo **cuando el pedido llega al almacén**, no al
registrarlo.

**Qué hacer:**
- `costo_importacion_usd` pasa a ser **nullable** en `POST /pedidos` (y en `PUT`). Si no viene,
  guardar `null`/0. Quitar cualquier validación `@NotNull`/`> 0` en el create.
- Nuevo endpoint **`PATCH /pedidos/{id}/costo`** (permiso `pedidos.editar`):
  ```json
  // request
  { "costo_importacion_usd": 29.00 }
  // response: data = Pedido, message "Costo de importación actualizado"
  ```
  Validar `> 0` (400 `VALIDATION` si no). El front lo llama cuando se exige el costo al mover al
  penúltimo estado (ver punto 3).

---

## 3. Reglas de estado server-side (autoritativas)

El estado **final** y el **penúltimo** se determinan por el campo `orden` de la tabla `estados`
(NO hardcodear nombres: el admin puede renombrar/crear estados). Final = mayor `orden`;
penúltimo = el `orden` inmediatamente anterior.

En **`PATCH /pedidos/{id}/estado`**, antes de cambiar el estado, validar:
- Si el estado destino es el **penúltimo** y `costo_importacion_usd <= 0` (o null) →
  rechazar `400 VALIDATION` ("Cargá el costo de importación antes de avanzar").
- Si el estado destino es el **final** y `estado_pago != 'liquidado'` →
  rechazar `400 VALIDATION` ("Liquidá el pago antes de marcar el pedido como entregado").

> Estas reglas son la fuente de verdad; el front ya las replica para UX (toasts), pero debe validar
> el backend igual. Flujo esperado: penúltimo estado ⇒ se exige costo ⇒ se cobra/liquida en
> Finanzas ⇒ recién entonces puede pasar a entregado.

---

## 4. Archivado de entregados (configurable por admin)

**Por qué:** la columna "Entregado" crece sin límite (cientos de tarjetas). Se archivan
**visualmente** (no se borran).

**Qué hacer:**
- **Config nueva** `dias_archivo_entregados` (int, default 7). Exponerla en `GET /config/publica`
  y aceptarla en `PUT /admin/config` (junto a `whatsapp_atencion`/`nombre_negocio`). El front ya
  tiene la pantalla para editarla.
- **Timestamp de entrega**: registrar `entregado_en` cuando un pedido entra al estado final
  (columna nueva en `pedidos`, o derivarlo del historial si existe). Necesario para medir los días.
- **`GET /tablero`**: **siempre excluir** los pedidos en estado final con
  `now - entregado_en > dias_archivo_entregados` (así la columna "Entregado" no crece sin límite).
- **Listado de archivados** (página propia en el front, NO un toggle del tablero):
  `GET /pedidos?archivados=true` debe devolver **solo** los archivados (estado final +
  `now - entregado_en > dias_archivo_entregados`), paginado igual que `GET /pedidos`
  (`content/page/size/total_elements/total_pages`, orden DESC por fecha). El front lo muestra en
  una tabla con todas las columnas (fecha, tracking, orden, titular, envío, valor, costo, estado, pago).
  > La columna "Fecha" del front usa `creado_en` (que ya viene en `PedidoListItem`); `entregado_en`
  > es **interno** para el cálculo de archivado. Si preferís mostrar la fecha de entrega, exponé
  > `entregado_en` en `PedidoListItem` y avisame para usarlo.
- **`GET /pedidos` sin el flag** sigue devolviendo **todos** los pedidos (incluidos los archivados):
  el listado general `/admin/pedidos` es el historial completo. El archivado **solo** afecta a
  `GET /tablero` y al listado `?archivados=true`.

---

## 5. Cotizador: refresco programado del tipo de cambio

**Estado actual:** `ExchangeRateService.java` ya **cachea** USD/PEN en memoria (TTL 6h, fallback
3.40) y lo refresca *lazy* (on-demand cuando expira). Esto **ya evita** el rate-limit por cotización
(las cotizaciones usan la variable cacheada, no pegan a la API externa).

**Mejora pedida:** que el refresco sea **programado** y determinista en vez de lazy:
- Agregar `@Scheduled` (con `@EnableScheduling`) que llame al refresh ~4 veces al día en horarios
  fijos (p. ej. cron `0 0 */6 * * *` = cada 6h). Mantener el fallback y el TTL como red de seguridad.
- El endpoint `GET /cotizador/tipo-cambio` sigue igual; el front no cambia.

---

## 6. Bug: "registro duplicado" al editar permisos

**Síntoma:** tras crear un empleado, al guardar sus permisos sale error de duplicado y no deja.

**Causa:** en `UsuarioService.actualizarPermisos` se hace `permisoRepository.deleteByUsuarioId(id)`
y luego `permisoRepository.saveAll(nuevos)` dentro de la misma transacción. Hibernate puede ordenar
los INSERT **antes** del DELETE al hacer flush, violando el `@UniqueConstraint(columnNames =
{"usuario_id","modulo"})` de `Permiso.java`.

**Fix sugerido (elegí uno):**
- `permisoRepository.flush()` **entre** el delete y el `saveAll` (forzar el DELETE antes de insertar). 
- o marcar el delete con `@Modifying(clearAutomatically = true, flushAutomatically = true)`.
- o hacer upsert real (actualizar los existentes en lugar de borrar+insertar).

El payload del front es correcto: `PUT /usuarios/{id}/permisos` con
`{ permisos: [{ modulo, puede_ver, puede_editar }, ...] }` (los 5 módulos siempre).

---

## 7. Exponer los estados en `GET /config/publica` (para la landing)

**Por qué:** la landing muestra la línea de estados ("Seguí tu pedido en tiempo real") con los
**estados reales** que el admin haya creado (son dinámicos). Hoy `GET /estados` exige auth, y
**no conviene abrirlo** (es un endpoint admin). En vez de eso, reusamos el endpoint que **ya es
público**: `/config/publica`.

**Qué hacer:** agregar al response de `GET /config/publica` un array `estados` con
**solo nombre, color y orden** (sin `id` ni nada sensible), ordenado por `orden`:
```json
{ "success": true, "data": {
  "whatsapp_atencion": "...", "nombre_negocio": "...", "dias_archivo_entregados": 7,
  "estados": [
    { "nombre": "Recibido", "color": "#0C447C", "orden": 1 },
    { "nombre": "En tránsito", "color": "#854F0B", "orden": 2 }
  ]
}}
```
Así no se abre ningún endpoint admin y la landing refleja los estados dinámicos. POST/PUT/DELETE de
`/estados` siguen siendo ADMIN (sin cambios).

> Mientras no venga `estados` en `/config/publica`, el front **cae a los 5 estados por defecto**
> (Recibido → … → Entregado), así que la landing no se rompe.

---

## Resumen de endpoints afectados
| Endpoint | Cambio |
|---|---|
| `GET /tablero` | + `num_tracking`, `estado_pago` por tarjeta; excluir siempre entregados archivados |
| `GET /pedidos?archivados=true` | listado paginado de archivados (entregado + N días) |
| `POST/PUT /pedidos` | `costo_importacion_usd` nullable |
| `PATCH /pedidos/{id}/costo` | **nuevo** |
| `PATCH /pedidos/{id}/estado` | validar costo (penúltimo) y liquidado (final) por `orden` |
| `GET /config/publica`, `PUT /admin/config` | + `dias_archivo_entregados` |
| `pedidos` (tabla) | + `entregado_en` |
| `ExchangeRateService` | refresco `@Scheduled` |
| `UsuarioService.actualizarPermisos` | flush/upsert (bug duplicado) |
| `GET /config/publica` | + array `estados` (nombre/color/orden) para la landing |
