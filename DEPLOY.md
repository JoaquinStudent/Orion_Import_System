# Guía de despliegue — Orión Logistic

Infraestructura objetivo (membresías ya compradas):

| Capa | Servicio | Qué corre |
|------|----------|-----------|
| Base de datos | **Supabase Pro** (PostgreSQL) | esquema + datos |
| Backend | **Railway** | API Spring Boot (`orion-backend/api`) |
| Frontend | **Cloudflare Pages** | sitio Next.js (`orion-frontend`) |
| DNS / borde / anti-DDoS | **Cloudflare** | proxy, SSL, WAF, Turnstile, rate-limit |
| Dominio | **Namecheap** | `orionlogisticperu.com` |

Dominios finales:
- `https://orionlogisticperu.com` → frontend (Cloudflare Pages)
- `https://api.orionlogisticperu.com/api/v1` → backend (Railway)

> Hacé los pasos **en orden**: BD → backend → frontend → DNS → anti-abuso → verificación.
> Cada capa necesita la URL de la anterior.

---

## 0. Pre-requisitos y hardening (hacelo ANTES de exponer nada)

1. **Rotá el `JWT_SECRET`.** El de desarrollo es débil y estuvo en `.env`. Generá uno nuevo
   de ≥32 caracteres aleatorios y usalo SOLO en Railway (no lo commitees):
   ```bash
   openssl rand -base64 48
   ```
2. **Cambiá la contraseña del admin semilla.** El usuario sembrado
   (`joaquin@orionlogistic.com`, pass de fábrica `admin123`, `password_temporal=true`) debe
   cambiar su clave en el primer login. No dejes `admin123` en producción.
3. **Verificá que NO se suban secretos.** `orion-backend/api/.env` está gitignoreado (correcto).
   Confirmá con `git status` que ningún `.env` aparece como staged.
4. **Repo en GitHub.** Railway y Cloudflare Pages despliegan desde GitHub; asegurate de que la
   rama a desplegar (`main`) esté pusheada y al día.

---

## 1. Base de datos — Supabase

1. Entrá al proyecto Supabase (o creá uno nuevo, región cercana, ej. `sa-east-1`).
2. **SQL Editor → New query** y ejecutá, en este orden, el contenido de:
   1. `orion-backend/files/setup_supabase.sql` (esquema base: estados, configuración,
      usuarios, permisos, pedidos, comunidades, productos + índices + seeds)
   2. `orion-backend/files/migracion_comunidades_pago.sql`
   3. `orion-backend/files/migracion_integridad_indices.sql`
   4. `orion-backend/files/migracion_seguridad_rls.sql`
   5. `orion-backend/files/migracion_mejoras_back.sql`
   6. `orion-backend/files/migracion_solicitudes.sql`  ← **nueva (registro público)**

   Todas las migraciones son idempotentes; si dudás, se pueden re-correr.
3. **Connection string.** Settings → Database → **Connection pooling** (modo *Session*,
   puerto `5432`). Anotá host, usuario y password. La `DATABASE_URL` para Spring queda:
   ```
   jdbc:postgresql://<pooler-host>:5432/postgres?user=<usuario-pooler>
   ```
   (usuario y password van además en `DATABASE_USERNAME` / `DATABASE_PASSWORD`).
4. El backend corre con `ddl-auto=validate`: **no crea tablas**, sólo valida que el esquema
   exista. Si el paso 2 quedó completo, validará OK al levantar.

---

## 2. Backend — Railway

1. **New Project → Deploy from GitHub repo**, elegí el repo `Orion_Import_System`.
2. **Root Directory**: `orion-backend/api`. Railway detecta Maven (pom.xml).
   - Build: `./mvnw clean package -DskipTests`
   - Start: `java -jar target/api-0.0.1-SNAPSHOT.jar`
3. **Variables** (Settings → Variables):
   ```
   DATABASE_URL=jdbc:postgresql://<pooler-host>:5432/postgres?user=<usuario>
   DATABASE_USERNAME=<usuario-pooler>
   DATABASE_PASSWORD=<password>
   JWT_SECRET=<el rotado en el paso 0>
   JWT_EXPIRATION=86400000
   EXCHANGE_API_KEY=<api key de ExchangeRate-API>
   CORS_ALLOWED_ORIGINS=https://orionlogisticperu.com
   TURNSTILE_SECRET=<secret de Turnstile, ver paso 5; vacío = sin captcha>
   ```
   > `CORS_ALLOWED_ORIGINS` admite varios separados por coma (ej. agregar el dominio de preview
   > de Pages mientras probás). En prod dejá solo el dominio real.
4. Deploy. Cuando esté verde, Railway da una URL `*.up.railway.app`. Probala:
   `https://<railway>.up.railway.app/api/v1/config/publica` debe responder el sobre JSON.
5. **Dominio custom**: Settings → Networking → Custom Domain → `api.orionlogisticperu.com`.
   Railway te da un destino CNAME; lo cargás en Cloudflare (paso 4).

---

## 3. Frontend — Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**, elegí el repo.
2. Configuración de build:
   - **Root directory**: `orion-frontend`
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - (Cloudflare detecta la salida de Next automáticamente)
3. **Environment variables** (Production):
   ```
   NEXT_PUBLIC_API_URL=https://api.orionlogisticperu.com/api/v1
   NEXT_PUBLIC_API_MOCK=false
   NEXT_PUBLIC_WA_NUMBER=<whatsapp real, ej. +51XXXXXXXXX>
   NEXT_PUBLIC_TURNSTILE_SITEKEY=<sitekey de Turnstile, ver paso 5>
   ```
4. Deploy. Probá la URL `*.pages.dev`. El público debería cargar; con `API_MOCK=false` pega al
   backend real (necesita los pasos 2 y 4 listos para que login/datos funcionen).
5. **Dominio**: Custom domains → agregá `orionlogisticperu.com` (y opcional `www`).

---

## 4. DNS — Namecheap → Cloudflare

1. **Activá Cloudflare como DNS del dominio.** En Cloudflare: Add a site → `orionlogisticperu.com`
   (plan Free alcanza). Cloudflare te da 2 nameservers.
2. En **Namecheap** → Domain List → Manage → *Nameservers* → **Custom DNS**, pegá los 2
   nameservers de Cloudflare. (Propagación: minutos a horas.)
3. En **Cloudflare → DNS**, registros:
   - `orionlogisticperu.com` → lo gestiona **Cloudflare Pages** (al agregar el dominio custom en
     el paso 3.5 Cloudflare crea el registro solo; si no, CNAME al destino `*.pages.dev`, proxied).
   - `api` → **CNAME** al destino que dio Railway (paso 2.5), **Proxied (naranja)**.
   - `www` (opcional) → CNAME a `orionlogisticperu.com`.
4. **SSL/TLS** → modo **Full (strict)**. Railway y Pages ya sirven HTTPS válido.
5. Cuando resuelva, verificá:
   - `https://orionlogisticperu.com` (front)
   - `https://api.orionlogisticperu.com/api/v1/config/publica` (back, JSON)

---

## 5. Anti-abuso — Turnstile + Rate limiting (Cloudflare)

El registro público de pedidos (`POST /solicitudes`) tiene dos capas. **La defensa real de DDoS
es Cloudflare**, en el borde; el tope diario de la app es para calidad de datos / spam, no frena
un ataque volumétrico.

1. **Turnstile** (captcha invisible, gratis):
   - Cloudflare → Turnstile → Add site → dominio `orionlogisticperu.com`.
   - Copiá la **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITEKEY` en Pages (paso 3).
   - Copiá la **Secret Key** → `TURNSTILE_SECRET` en Railway (paso 2).
   - Con secret presente, el back verifica el token server-side; sin secret, la verificación se
     omite (útil en dev). El front solo muestra el widget si hay sitekey.
2. **Rate Limiting rule** (Cloudflare → Security → WAF → Rate limiting rules):
   - Si el request URI **contiene** `/api/v1/solicitudes` y método `POST`
   - → cuando supere, p. ej., **5 requests / minuto por IP** → acción **Block** (o Managed
     Challenge) por 1 minuto.
3. **Tope diario de la app** (ya implementado): config `limite_solicitudes_dia` (default `50`,
   editable por el admin / por SQL en Supabase). Al superarlo, el back responde **429
   LIMITE_DIARIO**.

---

## 6. Verificación post-deploy (checklist)

- [ ] `GET /api/v1/config/publica` responde por el dominio `api.` (CORS OK desde el front).
- [ ] Login real en `/admin` con el admin (y cambio de contraseña forzado la primera vez).
- [ ] Alta de un pedido interno + aparece en listado/tablero.
- [ ] **Liquidar con costo 0 → falla** (botón deshabilitado en front; `PATCH /pedidos/{id}/pago`
      con `liquidado` y costo 0 → **400 VALIDATION** en el back).
- [ ] Cotizador y rastreo públicos funcionan.
- [ ] **Registro público** (`/registrar`): comunidad inválida → 400; válida → entra a
      `/admin/solicitudes`; aprobar → crea el pedido (estado inicial, pago pendiente, sin costo);
      NO aparece en finanzas hasta liquidarse.
- [ ] Superar el tope diario / la regla de rate-limit → 429 / bloqueo.
- [ ] HTTPS válido en ambos dominios; `www` redirige (si lo configuraste).

---

## Notas operativas

- **Migraciones futuras**: como `ddl-auto=validate`, cualquier cambio de esquema se aplica
  primero por SQL en Supabase y recién después se sube el código que lo usa (si no, el backend
  no levanta por validación).
- **Logs**: Railway (backend) y Cloudflare Pages (build/edge) tienen sus propios logs.
- **Rollback**: ambos (Railway y Pages) permiten volver a un deploy anterior desde su panel.
- **CORS**: si agregás un dominio nuevo (p. ej. staging), sumalo a `CORS_ALLOWED_ORIGINS` en
  Railway, separado por coma.
