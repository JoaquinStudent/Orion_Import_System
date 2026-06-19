# Mejoras de UX/sesión — qué debe ajustar el frontend (post-integración)

> Para Joaquín (front). Esto sale de testear el sistema **integrado** (front real contra el
> backend real, MSW apagado). Son 3 síntomas, **todos del frontend**. El backend ya provee todo lo
> necesario (`GET /auth/me`, listados paginados, KPIs server-side, CORS a `localhost:3000`) →
> **no requiere cambios**. Cada punto incluye la causa raíz (con el archivo exacto) y el fix.

---

## Contexto del testeo

- No hay `.env` en `orion-frontend`, así que `NEXT_PUBLIC_API_MOCK` es undefined → **MSW está
  apagado** y Axios (`src/lib/api.ts`) pega al backend real en `http://localhost:8080/api/v1`.
- O sea: lo que se ve son bugs **reales de integración**, no artefactos del mock.

Síntomas reportados:
1. Al iniciar sesión, el panel muestra **otro usuario** (entrás con A y el chrome muestra a B).
2. La UI se ve **incompleta / a medias** hasta hacer un refresh duro.
3. **Demora** al entrar a secciones con datos (~2 s con 4 pedidos) y sensación de que "hay que
   recargar para que aparezca el contenido".

---

## Bug A — Sesión muestra el usuario equivocado / chrome stale (prioridad ALTA)

**Síntomas 1 y 2.**

### Causa raíz
- `src/app/admin/layout.tsx` envuelve **también** a `/admin/login` (el login vive *dentro* del
  layout admin: ver `BARE_ROUTES`). El layout llama `useAuth()` y con ese `usuario` pinta
  `Topbar` y `SidebarNav`.
- `src/hooks/useAuth.ts` lee la cookie **una sola vez** en `useEffect([])`, y **no hay store
  compartido**: cada componente que usa `useAuth` tiene su propio `useState`. Hay instancias
  independientes en el layout y en cada página (p. ej. `dashboard/page.tsx`).
- `src/app/admin/login/page.tsx` (`onSubmit`) hace `setToken()` + `setUsuario()` y luego
  `router.replace("/admin/dashboard")` — navegación **client-side**. El layout admin **no se
  remonta**, así que su `useAuth` nunca vuelve a leer la cookie → `Topbar`/`SidebarNav` siguen
  mostrando el usuario anterior (o `?`/`—`) hasta un refresh duro, que recién ahí remonta todo y
  re-lee la cookie con el usuario correcto.

> Por eso el **saludo del dashboard** (página nueva que sí se monta) sale con el nombre correcto,
> pero el **Topbar/Sidebar** (en el layout no remontado) muestran al usuario viejo. Es el mismo
> bug visto desde dos lugares.

**No es solo cosmético:** `SidebarNav` filtra el menú con `puedeVer(usuario, modulo)`
(`src/lib/permisos.ts`). Con el usuario stale, se muestran ítems de navegación que no
corresponden al rol/permiso real hasta refrescar.

### Fix recomendado — store de auth global (una sola fuente de verdad)
Reemplazar el `useAuth` "read-once" por un **store/contexto de auth** montado una vez (React
Context o Zustand), hidratado de la cookie al inicio, que exponga `usuario`, `loading`,
`login(usuario)` y `logout()`:
- El login llama `login(usuario)` que actualiza el store **sincrónicamente**.
- Todos los consumidores (`Topbar`, `SidebarNav`, páginas) leen del store → se actualizan al
  instante y de forma consistente, **sin necesidad de remontar ni refrescar**.
- `logout()` limpia el store + la cookie (hoy `logout()` hace `clearSession()` pero el estado del
  layout queda stale igual; el store lo resuelve).

**Complemento (limpio):** sacar `/admin/login` y `/admin/cambiar-password` del layout con chrome,
moviéndolos a su propio route group (p. ej. `src/app/(auth)/login/`), de modo que **entrar al
panel monte el layout protegido desde cero** con la sesión ya seteada.

**Stopgap mínimo (si hay apuro, como puente):** en el `onSubmit` del login, tras setear las
cookies, navegar con `window.location.assign("/admin/dashboard")` en vez de `router.replace(...)`.
Eso fuerza un remonte completo y re-lee la cookie → mata el bug de inmediato. Contra: pierde el
feel SPA y re-descarga la app. Sirve como parche hasta tener el store.

### Criterio de aceptación
Tras una sesión de B (incluso sin desloguear "prolijo"), loguear con A muestra a **A** en
Topbar/Sidebar y el menú correcto **sin** refrescar.

---

## Bug B — Demora al navegar / "hay que recargar para ver contenido" (prioridad MEDIA)

**Síntoma 3.**

### Causa raíz
Cada página de datos usa el patrón **`useEffect` + `useState` + fetch manual, sin caché ni
prefetch**:
- `src/app/admin/pedidos/page.tsx` (dispara `listarEstados()` + `listarPedidos()` en cada visita)
- `src/app/admin/dashboard/page.tsx` (usa `Promise.all`, bien, pero igual sin caché)
- `src/app/admin/tablero/page.tsx`, `finanzas`, etc.

Cada navegación re-pide desde cero y muestra **spinner en blanco** mientras espera. Sumado a la
**latencia de Supabase remoto** (cada query es un round-trip a la nube) y a **Next en modo dev**
(sin optimizar), eso da los ~2 s.

> Importante: los ~2 s **no son por los 4 pedidos**. El listado ya está **paginado en el backend**
> (`page`/`size`), así que 1000 pedidos **no** lo colapsan. Es un problema de experiencia de carga
> del cliente, no de volumen de datos.

### Fix recomendado — TanStack Query (React Query)
- Agregar un `QueryClientProvider` (en `src/app/layout.tsx` o un provider cliente dedicado) y
  convertir cada página a `useQuery` con un `staleTime` razonable (30–60 s) y `queryKey` por
  filtros (p. ej. `["pedidos", { search, estadoId, page }]`).
- Beneficio directo: al **volver** a una sección ya visitada, los datos cacheados se muestran **al
  instante** (stale-while-revalidate) y se refetchea en segundo plano → desaparece el spinner en
  blanco y la sensación de "tener que recargar".
- Opcional: `prefetchQuery` en hover de los links del sidebar para que la sección ya esté lista al
  entrar.

### Medición justa
Medir el rendimiento con **build de producción** (`next build && next start`), no en `next dev`.
Buena parte de los ~2 s es overhead de dev + la DB remota; en prod + con caché baja muchísimo.

---

## Checklist para Joaquín

| Síntoma | Archivo(s) del front | Cambio |
|---|---|---|
| Usuario equivocado / chrome stale | `hooks/useAuth.ts`, `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `components/admin/Topbar.tsx`, `components/admin/Sidebar.tsx` | Store de auth global; `login()` actualiza sincrónicamente; (opc.) mover login a route group `(auth)` |
| Menú con ítems que no corresponden | `components/admin/Sidebar.tsx` + `lib/permisos.ts` | Se arregla solo al tener el `usuario` fresco del store |
| Parche rápido del bug de identidad | `app/admin/login/page.tsx` | `window.location.assign("/admin/dashboard")` en vez de `router.replace` |
| Demora / recargar para ver datos | `app/layout.tsx` + todas las `admin/**/page.tsx` con fetch | `QueryClientProvider` + `useQuery` con `staleTime`; (opc.) prefetch en hover |

---

## Notas de despliegue (para producción)

- Crear el `.env` del front con `NEXT_PUBLIC_API_URL` apuntando al backend real (Railway). Hoy,
  al no existir `.env`, Axios usa el default `http://localhost:8080/api/v1` (`src/lib/api.ts`),
  que solo sirve en local.
- Confirmar que el backend liste ese origen en `CORS_ALLOWED_ORIGINS` (hoy default
  `http://localhost:3000`).
- `NEXT_PUBLIC_API_MOCK` debe quedar **sin** setear (o `false`) en prod para no activar MSW.

---

## Qué NO hace falta tocar

- **Backend:** ya expone `GET /auth/me` (refresco de permisos), listados paginados, KPIs/tablero
  server-side (escalan), y CORS configurable. Ningún cambio necesario para estos 3 bugs.
- **Esquema de BD:** sin relación con estos síntomas.

*Documento generado por el back (José) como hand-off al front (Joaquín). Complementa a
[05d_mejoras_back.md](05d_mejoras_back.md), que fue en sentido inverso (front → back).*
