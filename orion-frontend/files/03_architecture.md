# 03 — Arquitectura del Sistema

> **SDD Orión Logistic** · Documento 3 de 9 · Versión 2.0
> Responsable: Ambos (Joaquín + José)

---

## 3.1 Visión general

El sistema usa una arquitectura de **monolito modular** con frontend y backend separados en **dos repositorios independientes**, comunicados por una API REST. Para ~1,000 pedidos mensuales y un equipo de 2 personas con 4 semanas de plazo, los microservicios serían sobreingeniería. El monolito modular da la simplicidad para entregar a tiempo, manteniendo el código organizado por módulos.

```
┌─────────────────────────┐      ┌─────────────────────────┐
│   FRONTEND (Cliente)     │      │   FRONTEND (Admin)       │
│   Next.js 14             │      │   Next.js 14             │
│   Cloudflare Pages       │      │   Cloudflare Pages       │
│   · Landing page         │      │   · Dashboard            │
│   · Cotizador simple     │      │   · Pedidos / Tablero    │
│   · Rastreador           │      │   · Finanzas / Cotizador │
└───────────┬─────────────┘      └───────────┬─────────────┘
            │      REST API + JWT             │
            └────────────────┬────────────────┘
                             ▼
            ┌────────────────────────────────┐
            │   BACKEND — Spring Boot 3       │
            │   Railway                       │
            │  ┌──────────────────────────┐   │
            │  │ Módulo Auth (JWT)         │   │
            │  │ Módulo Pedidos            │   │
            │  │ Módulo Estados            │   │
            │  │ Módulo Cotizador          │   │
            │  │ Módulo Finanzas           │   │
            │  │ Módulo Usuarios/Roles     │   │
            │  │ Módulo Configuración      │   │
            │  └──────────────────────────┘   │
            └────────────────┬────────────────┘
                             ▼
            ┌────────────────────────────────┐
            │   PostgreSQL (Supabase Pro)     │
            │   + Backups diarios             │
            └────────────────────────────────┘
                             ▲
            ┌────────────────┴────────────────┐
            │   Servicios externos            │
            │   · ExchangeRate-API (dólar)    │
            │   · WhatsApp (enlaces wa.me)    │
            └────────────────────────────────┘
```

---

## 3.2 Stack tecnológico

### Frontend

| Tecnología | Uso |
|-----------|-----|
| **Next.js 14** | Framework principal (App Router) |
| **Tailwind CSS** | Estilos utilitarios |
| **shadcn/ui** | Componentes preconstruidos |
| **TypeScript** | Tipado estático |
| **Axios** | Cliente HTTP para la API |
| **Cloudflare Pages** | Hosting (gratuito, uso comercial OK) |

### Backend

| Tecnología | Uso |
|-----------|-----|
| **Java Spring Boot 3** | Framework principal |
| **Spring Security** | Autenticación y autorización |
| **Spring Data JPA** | ORM (Hibernate) |
| **JWT (jjwt)** | Tokens de sesión |
| **Apache POI** | Generación de archivos Excel |
| **Maven** | Gestión de dependencias |
| **Railway** | Hosting del backend |

### Base de datos y servicios

| Servicio | Uso |
|----------|-----|
| **PostgreSQL (Supabase Pro)** | Base de datos + backups diarios |
| **ExchangeRate-API** | Tipo de cambio USD→PEN en vivo |
| **wa.me** | Enlaces directos a WhatsApp |

---

## 3.3 Repositorio Frontend — `orion-frontend`

Convención: los grupos de rutas `(public)` y `(admin)` son invisibles en la URL y sirven solo para aplicar layouts distintos. La carpeta `ui/` de shadcn nunca se edita manualmente.

```
orion-frontend/
├── .env.local.example             ← variables para el equipo (sin valores reales)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                ← config de shadcn/ui
├── package.json
├── public/
│   ├── favicon.ico
│   └── logo.svg
└── src/
    ├── app/
    │   ├── layout.tsx                      ← root layout (fuente Inter, metadatos globales)
    │   ├── (public)/
    │   │   ├── layout.tsx                  ← navbar + footer + botón WA flotante
    │   │   ├── page.tsx                    ← landing page
    │   │   ├── cotizar/
    │   │   │   └── page.tsx
    │   │   └── rastrear/
    │   │       └── page.tsx
    │   └── (admin)/
    │       ├── layout.tsx                  ← sidebar + topbar + auth guard
    │       ├── login/
    │       │   └── page.tsx
    │       ├── dashboard/
    │       │   └── page.tsx
    │       ├── pedidos/
    │       │   ├── page.tsx                ← lista con filtros y búsqueda
    │       │   └── nuevo/
    │       │       └── page.tsx            ← formulario de registro de pedido
    │       ├── tablero/
    │       │   └── page.tsx                ← kanban de estados
    │       ├── finanzas/
    │       │   └── page.tsx
    │       ├── cotizador/
    │       │   └── page.tsx                ← config admin (flete + desaduanaje)
    │       └── configuracion/
    │           ├── page.tsx                ← WhatsApp de atención + ajustes generales
    │           └── usuarios/
    │               └── page.tsx            ← CRUD empleados y asignación de permisos
    ├── components/
    │   ├── ui/                             ← shadcn/ui (auto-generados, NO editar)
    │   ├── admin/
    │   │   ├── Sidebar.tsx
    │   │   ├── Topbar.tsx
    │   │   ├── PedidoTable.tsx
    │   │   ├── KanbanBoard.tsx
    │   │   └── FinanzasChart.tsx
    │   └── cliente/
    │       ├── Navbar.tsx
    │       ├── Footer.tsx
    │       ├── WhatsAppButton.tsx          ← flotante fijo en todas las páginas públicas
    │       ├── CotizadorForm.tsx
    │       ├── CotizadorResult.tsx         ← desglose: flete + desaduanaje + total soles
    │       └── TrackingTimeline.tsx        ← línea de tiempo de estados del pedido
    ├── lib/
    │   ├── api.ts                          ← instancia Axios con interceptor JWT en headers
    │   ├── auth.ts                         ← guardar/leer/borrar token (cookie httpOnly)
    │   └── cotizador.ts                    ← Math.ceil en cliente para preview en vivo
    ├── hooks/
    │   ├── useAuth.ts                      ← estado de sesión + redirect a login
    │   └── usePermiso.ts                   ← verifica si el usuario puede ver/editar un módulo
    └── types/
        ├── pedido.ts
        ├── usuario.ts
        ├── cotizador.ts
        └── api.ts                          ← ApiResponse<T> wrapper genérico
```

**Variables de entorno (`.env.local.example`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WA_NUMBER=+51999999999
```

---

## 3.4 Repositorio Backend — `orion-backend`

Cada módulo de negocio sigue el patrón `Controller → Service → Repository → Entity`. Los DTOs desacoplan la capa HTTP de la persistencia. El módulo `common/` contiene utilidades transversales: seguridad, CORS, manejo de errores y el cliente del tipo de cambio.

```
orion-backend/
├── pom.xml
├── .env.example
├── .gitignore
└── src/
    ├── main/
    │   ├── java/com/orionlogistic/api/
    │   │   ├── OrionApiApplication.java
    │   │   ├── auth/
    │   │   │   ├── AuthController.java
    │   │   │   ├── AuthService.java
    │   │   │   ├── JwtService.java
    │   │   │   └── dto/
    │   │   │       ├── LoginRequest.java
    │   │   │       ├── LoginResponse.java
    │   │   │       └── CambiarPasswordRequest.java
    │   │   ├── pedidos/
    │   │   │   ├── PedidoController.java
    │   │   │   ├── PedidoService.java
    │   │   │   ├── PedidoRepository.java
    │   │   │   ├── Pedido.java
    │   │   │   └── dto/
    │   │   │       ├── PedidoRequest.java
    │   │   │       └── PedidoResponse.java
    │   │   ├── productos/
    │   │   │   ├── Producto.java
    │   │   │   └── ProductoRepository.java
    │   │   ├── estados/
    │   │   │   ├── EstadoController.java
    │   │   │   ├── EstadoService.java
    │   │   │   ├── EstadoRepository.java
    │   │   │   └── Estado.java
    │   │   ├── cotizador/
    │   │   │   ├── CotizadorController.java
    │   │   │   ├── CotizadorService.java        ← Math.ceil(peso_kg) + regla umbral $200
    │   │   │   └── dto/
    │   │   │       ├── CotizarRequest.java
    │   │   │       └── CotizarResponse.java
    │   │   ├── finanzas/
    │   │   │   ├── FinanzasController.java
    │   │   │   ├── FinanzasService.java
    │   │   │   └── ExcelExportService.java       ← Apache POI, genera .xlsx
    │   │   ├── usuarios/
    │   │   │   ├── UsuarioController.java
    │   │   │   ├── UsuarioService.java
    │   │   │   ├── UsuarioRepository.java
    │   │   │   ├── Usuario.java
    │   │   │   ├── Permiso.java
    │   │   │   ├── PermisoRepository.java
    │   │   │   └── dto/
    │   │   │       ├── CrearUsuarioRequest.java
    │   │   │       └── AsignarPermisosRequest.java
    │   │   ├── rastreo/
    │   │   │   ├── RastreoController.java
    │   │   │   ├── RastreoService.java
    │   │   │   └── dto/
    │   │   │       ├── RastreoRequest.java
    │   │   │       └── RastreoResponse.java
    │   │   ├── config/
    │   │   │   ├── ConfiguracionController.java
    │   │   │   ├── ConfiguracionService.java
    │   │   │   ├── ConfiguracionRepository.java
    │   │   │   └── Configuracion.java
    │   │   └── common/
    │   │       ├── SecurityConfig.java
    │   │       ├── CorsConfig.java
    │   │       ├── GlobalExceptionHandler.java
    │   │       ├── ExchangeRateClient.java        ← llama ExchangeRate-API y cachea resultado
    │   │       └── ApiResponse.java               ← wrapper { success, data, message }
    │   └── resources/
    │       ├── application.properties             ← referencias a vars de entorno (${DATABASE_URL})
    │       └── application-prod.properties
    └── test/
        └── java/com/orionlogistic/api/
            ├── auth/
            │   └── AuthServiceTest.java
            └── cotizador/
                └── CotizadorServiceTest.java       ← valida: $20 + 1.3 kg → S/ 98.60
```

**Variables de entorno (`.env.example`):**
```
DATABASE_URL=jdbc:postgresql://...
JWT_SECRET=...
JWT_EXPIRATION=86400000
EXCHANGE_API_KEY=...
CORS_ALLOWED_ORIGINS=https://orionlogisticperu.com
```

---

## 3.5 Flujo de comunicación Front ↔ Back

1. El usuario interactúa con el frontend (Next.js).
2. El frontend hace una petición HTTP (Axios) a la API.
3. Si es endpoint protegido, incluye el JWT en `Authorization: Bearer <token>`.
4. El backend valida el token y los permisos.
5. El service ejecuta la lógica y consulta la base de datos.
6. El backend responde con JSON.
7. El frontend renderiza la respuesta.

---

## 3.6 Despliegue

| Componente | Plataforma | Notas |
|-----------|------------|-------|
| Frontend cliente | Cloudflare Pages | Build de Next.js, dominio orionlogisticperu.com |
| Frontend admin | Cloudflare Pages | Subdominio o ruta /admin |
| Backend | Railway | JAR de Spring Boot, variables de entorno |
| Base de datos | Supabase | PostgreSQL gestionado |

**Variables de entorno clave (backend):**
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `EXCHANGE_API_KEY`, `CORS_ALLOWED_ORIGINS`.

---

## 3.7 Punto crítico de sincronización

Desde el **día 1 del Sprint 1**, Joaquín y José deben acordar y documentar el **contrato de la API** (endpoints, parámetros y forma de respuestas JSON) en Postman o Swagger. Esto permite trabajar en paralelo sin bloqueos.

---

*Anterior: [02 — Requerimientos](02_requirements.md) · Siguiente: [04 — Base de datos →](04_database.md)*
