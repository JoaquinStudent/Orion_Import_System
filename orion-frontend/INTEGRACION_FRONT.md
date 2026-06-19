# Integración Front ↔ Back — qué debe tener en cuenta el frontend (Sprint 4)

> Guía para Joaquín (front). Resume **todo lo que cambió en el backend** y qué debe ajustar el
> front para no romperse. Contrato detallado de cada endpoint: `files/05c_contrato_sprint4.md`
> (y `files/05b_contrato_sprint2.md`). El backend de esta fase es **aditivo**: nada de lo
> existente dejó de funcionar; lo de abajo es para *aprovechar* lo nuevo y *evitar conflictos*.

---

## A. Cambios que el front DEBE adoptar (cierran bugs del Sprint 4)

### A1. Dashboard → `GET /dashboard/resumen` (permiso `pedidos.ver`)
**Por qué:** hoy `dashboard/page.tsx` trae `listarPedidos({ size: 200 })` y calcula los 4 KPIs y
"últimos pedidos" en el browser → **incorrectos pasados 200 pedidos**.
**Qué hacer:**
- Reemplazar esa carga por una sola llamada a `GET /dashboard/resumen`.
  Devuelve `{ pedidos_hoy, en_transito, en_aduana, entregados_mes, ultimos[] }`.
- El card **"Ingresos este mes"** se queda como está (sigue usando `obtenerResumen`, permiso `finanzas.ver`).
- Crear el tipo, p. ej. `src/types/dashboard.ts`, y un service `src/lib/services/dashboard.ts`.

### A2. Finanzas → `GET /finanzas/kpis` + `desglose_tipo_envio`
**Por qué:** `finanzas/page.tsx` también deriva todo de `listarPedidos({ size: 200 })`.
**Qué hacer:**
- **Tarjetas KPI (hoy / mes / año):** usar `GET /finanzas/kpis`
  → `{ ingreso_hoy_usd, ingreso_ayer_usd, ingreso_mes_usd, pedidos_mes, ingreso_anio_usd, mejor_mes }`.
  - Delta "vs ayer" = `(ingreso_hoy_usd - ingreso_ayer_usd) / ingreso_ayer_usd` (si `ayer > 0`).
  - `mejor_mes` viene **1–12** o `null` → `MESES[mejor_mes - 1]` (ojo: `MESES` es 0-indexed).
- **Panel "Resumen del período":** usar `GET /finanzas/resumen` (ya devuelve `total_pedidos`,
  `ingreso_total_usd` y ahora **`desglose_tipo_envio`**: `[{ tipo_envio, cantidad }]`, con
  `tipo_envio: null` = "Sin asignar"). Ya no derivar el desglose de la lista local.
- **Tabla "Detalle" (8 filas):** `listarPedidos({ size: 8 })` (el backend ya ordena DESC por `creado_en`).
- Tras **"Liquidar"** un pago: refrescar `GET /finanzas/kpis` y `GET /finanzas/resumen`
  (antes recalculaba sobre el array local).
- Extender `src/types/finanzas.ts` con `desglose_tipo_envio` y un tipo para los KPIs.

### A3. Refrescar permisos con `GET /auth/me`
**Por qué:** hoy el usuario/permisos se leen de la cookie del login y quedan **stale** si un ADMIN
cambia permisos; el front no se entera hasta el próximo login.
**Qué hacer:** al montar el panel (`src/app/admin/layout.tsx` o `hooks/useAuth.ts`), llamar
`GET /auth/me` y refrescar la cookie con `setUsuario(...)`. Shape idéntico al usuario del login.

### A4. Sidebar filtrado por permisos (front-only, ya posible)
`components/admin/Sidebar.tsx` renderiza todos los `NAV_ITEMS`. Filtrar con
`puedeVer(usuario, item.modulo)` (los items ya traen `modulo`; "Dashboard" no tiene `modulo` →
siempre visible). No depende del backend.

---

## B. Gotchas para NO romper (contrato de errores y datos)

1. **Interceptor / códigos de error.** El backend ahora responde con el envelope `ApiResponse`
   también en auth/permiso:
   - **401 `AUTH_INVALID`** = sin sesión / token inválido → el interceptor desloguea (correcto).
   - **403 `SIN_PERMISO`** = logueado pero sin permiso → el interceptor muestra **toast** (no desloguea).
   - **400 `VALIDATION`** = dato inválido (p. ej. contraseña actual incorrecta) → **NO** es sesión vencida;
     mostrar el mensaje, no desloguear. El interceptor ya lo maneja bien hoy; no agregar lógica que
     trate 400 como logout.
   - **500 `ERROR_INTERNO`** = error genérico (sin detalles internos) → mensaje genérico al usuario.

2. **Password mínima = 8 también al CREAR usuario** (antes 6). Alinear la validación del form de alta
   en `UsuariosAdmin`/zod, o el backend devolverá `400 VALIDATION`.

3. **Snake_case + envelope.** Todo viene en snake_case dentro de `{ success, data, ... }`.
   Desenvolver `data.data` como ya hacen los services.

4. **Permisos del dashboard.** `GET /dashboard/resumen` requiere `pedidos.ver` y el card de ingresos
   requiere `finanzas.ver` (igual que hoy). Un EMPLEADO sin esos permisos verá secciones vacías/errores
   → conviene gatear esas llamadas con `puedeVer(usuario, ...)` antes de pedirlas.

5. **`mejor_mes`** es número (1–12) o `null`, no un nombre. Mapear en el front.

6. **`tipo_envio`** sigue siendo `almacen|lima|shalom|null`. El backend valida el enum (400 si no).

---

## C. Sin cambios (siguen igual)
Rutas, paginación (`content/page/size/total_elements/total_pages`), login, comunidades,
`PATCH /pedidos/{id}/pago`, `PATCH /pedidos/{id}/estado`, tablero, cotizador, rastreo, exportar Excel.
El flag mock/real (`NEXT_PUBLIC_API_MOCK`) y los mocks MSW deben actualizarse para reflejar los
nuevos endpoints (`/dashboard/resumen`, `/finanzas/kpis`, `desglose_tipo_envio`) si se quiere seguir
desarrollando sin backend.
