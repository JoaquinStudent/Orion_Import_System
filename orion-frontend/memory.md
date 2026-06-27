# orion-frontend — memoria

Panel admin + sitio público de Orión Logistic. Parte del **monorepo** `Orion_Import_System`
(la otra carpeta es `orion-backend/`). Deploy: **Cloudflare Pages**.

## Stack
- Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (instalado **manual**, no CLI)
- TanStack Query (server state) · React Hook Form + Zod (formularios) · Axios (`src/lib/api.ts`)
- framer-motion (animaciones del público) · recharts (finanzas) · lucide-react (íconos)
- **MSW** para mocks (`src/mocks/`): desarrollo sin backend

## Estructura `src/`
- `app/(public)/` — sitio del cliente: `/` landing, `/cotizar`, `/rastrear`, `/registrar`
  (registro público de pedidos), `/nosotros`, `/productos-prohibidos`, `/terminos`,
  `/privacidad`, `/libro-reclamaciones`. Layout con `PublicNavbar` + `PublicFooter` + WhatsApp.
- `app/admin/` — panel: `dashboard`, `pedidos`, `solicitudes` (cola de revisión),
  `tablero` (kanban DnD nativo), `finanzas`, `cotizador`, `configuracion`. Sidebar en
  `components/admin/Sidebar.tsx` (ítems en `lib/constants.ts → NAV_ITEMS`, filtrados por permiso).
- `lib/services/` — una función por endpoint (pedidos, estados, comunidades, solicitudes,
  cotizador, rastreo, finanzas, usuarios, config). Todas devuelven `data.data` del sobre.
- `lib/api.ts` — Axios con interceptor que inyecta JWT si hay token; 401/403 sin sesión → login;
  403 `SIN_PERMISO` → toast.
- `components/` — `ui/` (shadcn), `pedidos/` (PedidoForm compartido), `cliente/`
  (SolicitudForm, Turnstile, PublicNavbar…), `admin/`, `config/`, `usuarios/`.
- `mocks/` — `db.ts` (datos en memoria) + `handlers.ts` (MSW, fieles al contrato del back).

## Contrato / convenciones
- API REST en `/api/v1`, sobre `ApiResponse`: `{ success, data, message }` | `{ success, error, code }`.
- **JSON snake_case** (`num_tracking`, `estado_pago`, `costo_importacion_usd`…). Los tipos TS
  ya usan snake_case para mapear directo.
- Paginado: `{ content, page, size, total_elements, total_pages }`.

## Variables de entorno (`.env.local`)
- `NEXT_PUBLIC_API_URL` — base de la API (dev `http://localhost:8080/api/v1`).
- `NEXT_PUBLIC_API_MOCK` — `true` usa MSW; `false` pega al backend real.
- `NEXT_PUBLIC_WA_NUMBER` — WhatsApp fallback.
- `NEXT_PUBLIC_TURNSTILE_SITEKEY` — sitekey de Cloudflare Turnstile (vacío = sin captcha en dev).

## Reglas de negocio relevantes en el front
- Costo de importación **opcional** al crear; se exige al penúltimo estado del tablero y se
  bloquea el estado final si `estado_pago != liquidado`.
- **No se puede liquidar** un pedido con costo 0/null (botones deshabilitados en detalle y
  finanzas; el guard autoritativo está en el back).
- **Registro público de clientes** (`/registrar`): mismo form que el alta interna pero sin
  costo/estado/tipo_envío; comunidad obligatoria del catálogo público; Turnstile + tope diario.
  Cae en la cola `/admin/solicitudes`; el admin aprueba → se crea el pedido real.

## `files/` (documentación SDD, espejo del back)
`00_index` … `10_supabase_sql`, más contratos `05b`/`05c` y plan diario `08b`. Es el SDD v2.0.

## Cómo correr
`npm install && npm run dev` (puerto 3000). Ver `RUNNING.md` en la raíz del repo.
Typecheck: `npx tsc --noEmit`.
