# orion-backend — memoria

API REST de Orión Logistic. Parte del **monorepo** `Orion_Import_System` (la otra carpeta es
`orion-frontend/`). Código en `orion-backend/api/`. Deploy: **Railway**.

## Stack
- Java 21 · Spring Boot 3.5.15 (Maven, wrapper `mvnw`) · Spring Web / Data JPA / Security
- JWT con **jjwt 0.12.6** · Apache POI (export `.xlsx` de finanzas) · springdoc-openapi (Swagger)
- BD: **PostgreSQL en Supabase** (pooler). `spring.jpa.hibernate.ddl-auto=validate` →
  **el esquema NO lo crea JPA**: se aplica por SQL (ver `files/*.sql`) antes de levantar.

## Convenciones
- Context-path `/api/v1`, puerto 8080. JSON **snake_case** (`spring.jackson...=SNAKE_CASE`).
- Sobre uniforme `ApiResponse.ok(data,msg)` / `ApiResponse.error(msg,code)`.
- Errores mapeados en `common/GlobalExceptionHandler`: `NotFoundException`→404 NO_ENCONTRADO,
  `DuplicadoException`→409 DUPLICADO, `ValidationException`→400 VALIDATION,
  `ForbiddenException`→403 SIN_PERMISO, `RateLimitException`→429 LIMITE_DIARIO.
- Permisos por módulo vía `common/PermisoChecker` (`exigirVer`/`exigirEditar`,
  módulos: pedidos, tablero, finanzas, cotizador, configuracion). ADMIN = acceso total.

## Módulos (`api/src/main/java/com/orionlogistic/api/`)
- `auth` — login JWT, cambiar/​reset password (`JwtService`, `JwtAuthFilter`).
- `pedidos` — CRUD, tablero (cambiar estado con reglas por `orden`), costo, pago, archivado.
- `estados` — columnas del kanban (CRUD, `orden`).
- `comunidades` — catálogo (combobox). `GET /comunidades/publicas` es **público**.
- `solicitudes` — **registro público de pedidos** (cola de revisión, ver abajo).
- `cotizador` — cálculo + tipo de cambio (ExchangeRate-API cacheada).
- `finanzas` — resumen + export Excel.
- `configuracion` — key-value (`flete_por_kilo`, `desaduanaje`, `dias_archivo_entregados`,
  `limite_solicitudes_dia`…).
- `usuarios` — ABM + permisos (solo ADMIN).
- `common` — `ApiResponse`, excepciones, `SecurityConfig`, `CorsConfig`, `PermisoChecker`.

## Endpoints públicos (permitAll en `SecurityConfig`)
`/auth/login`, `/cotizador/**`, `/rastreo/**`, `/config/publica`, `/comunidades/publicas`,
**`POST /solicitudes`** (solo el alta; revisar/aprobar/rechazar exige auth), Swagger.
Resto autenticado; `/usuarios/**` y `/admin/**` solo ADMIN. OPTIONS siempre permitido (CORS).

## Reglas de negocio relevantes
- **Liquidar pago** exige `costo_importacion_usd > 0` (`PedidoService.cambiarEstadoPago`).
  Reglas de estado en `validarReglasDeEstado` (penúltimo exige costo; final exige liquidado).
- **Solicitudes** (tabla `solicitudes`, separada de `pedidos`): el cliente registra desde la
  landing. Anti-abuso: Cloudflare Turnstile (`TurnstileVerifier`, verifica si hay
  `TURNSTILE_SECRET`) + tope diario (`limite_solicitudes_dia`). Comunidad obligatoria del
  catálogo activo. Productos como **JSONB**. Al aprobar se reusa `PedidoService.crear`.

## Variables de entorno (`api/.env`, gitignoreado; plantilla `.env.example`)
`DATABASE_URL/USERNAME/PASSWORD`, `JWT_SECRET` (≥32 chars), `JWT_EXPIRATION`,
`EXCHANGE_API_KEY`, `CORS_ALLOWED_ORIGINS`, `TURNSTILE_SECRET` (vacío = sin captcha).
Se cargan vía `spring.config.import=optional:file:.env,optional:file:api/.env`.

## `files/` — SDD + SQL
SDD `00`…`10` (+ `05b/05c` contratos, `08b` plan). SQL: `setup_supabase.sql` (esquema base) y
migraciones idempotentes `migracion_comunidades_pago`, `migracion_integridad_indices`,
`migracion_seguridad_rls`, `migracion_mejoras_back`, **`migracion_solicitudes`**.
Aplicarlas en el SQL Editor de Supabase antes de levantar (por `ddl-auto=validate`).

## Cómo correr
`cd api && ./mvnw spring-boot:run` (necesita `.env` + esquema en Supabase). Tests:
`./mvnw test`. Ver `RUNNING.md` en la raíz.
