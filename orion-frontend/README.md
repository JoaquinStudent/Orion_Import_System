# Orión Logistic — Frontend

Panel de administración + app pública del sistema de gestión de importaciones de
**Orión Logistic**. Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui.

> Documentación de diseño (SDD) en [`files/`](./files). Mockups de referencia en
> `Desing_PaneAdmin/` y `Desing_Client/`. Repo del backend (Spring Boot): `orion-backend`.

## Requisitos

- Node.js ≥ 18
- npm

## Puesta en marcha

```bash
npm install
cp .env.local.example .env.local   # ajusta los valores si hace falta
npm run dev
```

Abre http://localhost:3000.

- Panel admin: `/admin/login`
- App pública: `/`

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend (José). Local: `http://localhost:8080/api/v1`. |
| `NEXT_PUBLIC_WA_NUMBER` | WhatsApp de atención (fallback; en runtime se lee de `GET /config/publica`). |
| `NEXT_PUBLIC_API_MOCK` | `true` = usa mocks locales (MSW). `false` = usa el backend real. |

## Mocks de API (MSW)

Mientras el backend está en construcción, el frontend funciona con
[Mock Service Worker](https://mswjs.io). Los handlers respetan el contrato del
SDD (doc 05) y viven en `src/mocks/handlers.ts`.

- **Activar:** `NEXT_PUBLIC_API_MOCK=true` (por defecto en desarrollo).
- **Desactivar (backend real):** `NEXT_PUBLIC_API_MOCK=false`.

Usuarios de prueba para el login:

| Email | Contraseña | Resultado |
|-------|------------|-----------|
| `joaquin@orionlogistic.com` | `admin123` | Admin → entra directo al dashboard |
| `jose@orionlogistic.com` | `temp123` | Empleado → fuerza cambio de contraseña |

## Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

## Estructura

```
src/
  app/
    (public)/        rutas públicas (landing, cotizador, rastreador) — grupo invisible en la URL
    admin/           panel admin (/admin/login, /admin/dashboard, ...)
  components/
    ui/              shadcn/ui (Radix + Tailwind)
    admin/           Sidebar, Topbar
    cliente/         WhatsAppButton
    providers/       MswProvider
  lib/               api (Axios), auth (sesión), constants, utils
  hooks/             useAuth
  types/             api, usuario
  mocks/             handlers + worker (MSW)
```

## Estado (Sprint 4 — en curso)

- **Sprint 1 ✅** Setup, design system, login, layout admin (sidebar + topbar + guard),
  cambio de contraseña temporal y sesión JWT.
- **Sprint 2 ✅** Pedidos (lista/filtros/detalle/CRUD), tablero kanban, estados, roles/permisos.
- **Sprint 3 ✅** Finanzas, cotizador (público + config), landing y rastreador público.
- **Sprint 4 (en curso)** Comunidades, estado de pago, tipo de envío, dashboard con KPIs.
  Pendiente front: consumir los endpoints server-side de dashboard/finanzas y `/auth/me`,
  filtrar sidebar por permisos, pase responsive y deploy. Ver **`INTEGRACION_FRONT.md`**
  (qué adoptar del backend del Sprint 4) y `files/05c_contrato_sprint4.md` (contrato).
