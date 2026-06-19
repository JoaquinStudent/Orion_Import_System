# Cómo correr Orión Logistic en local

Monorepo con dos apps: **`orion-backend/`** (Spring Boot 3 + Supabase) y **`orion-frontend/`** (Next.js 14).
La base de datos es **Supabase en la nube** (no hay Postgres local que levantar).

## Requisitos
- **JDK 21+** (Java 22 también funciona)
- **Node.js 18+** y npm
- Conexión a internet (para Supabase)

---

## 🟦 Backend — puerto 8080

### 1. Credenciales (`.env`)
El backend lee las variables desde `orion-backend/api/.env` (este archivo **no** está en git).
La primera vez, copiá la plantilla y completá los valores:

```bash
# desde orion-backend/api/
cp .env.example .env      # Windows: copy .env.example .env
```

Variables que van en el `.env` (pedíselas a un compañero o sacalas del panel de Supabase):
```
DATABASE_URL=jdbc:postgresql://<host>:<port>/postgres?user=<usuario>
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=...            # mínimo 32 caracteres
JWT_EXPIRATION=86400000
EXCHANGE_API_KEY=...
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

> Alternativa: en vez del `.env` se pueden poner las mismas variables en *IntelliJ → Run → Edit Configurations → Environment variables*. Las variables del entorno **tienen prioridad** sobre el `.env`.
>
> El `.env` se busca tanto en `orion-backend/api/.env` como en `orion-backend/api/` relativo a la raíz, así que funciona sin importar el working directory de IntelliJ.

### 2. Levantar

**IntelliJ:** abrir el proyecto y darle ▶ a `ApiApplication`.

**Terminal:**
```bash
cd orion-backend/api
# macOS / Linux:
./mvnw spring-boot:run
# Windows (PowerShell):
.\mvnw.cmd spring-boot:run
```

Listo cuando ves `Started ApiApplication`. Queda en:
- API: http://localhost:8080/api/v1
- Swagger: http://localhost:8080/api/v1/swagger-ui.html

---

## 🟩 Frontend — puerto 3000

```bash
cd orion-frontend
npm install        # solo la primera vez

# Opción A — contra el backend real (requiere el back corriendo):
# macOS / Linux:
NEXT_PUBLIC_API_MOCK=false npm run dev
# Windows (PowerShell):
$env:NEXT_PUBLIC_API_MOCK="false"; npm run dev

# Opción B — con mocks MSW (NO necesita backend):
npm run dev        # usa .env.local (NEXT_PUBLIC_API_MOCK=true por defecto)
```

App: http://localhost:3000 · Login: http://localhost:3000/admin/login

---

## 🔁 Cambiar de mocks (MSW) a backend real

Mientras el backend de un sprint no exista, el front trabaja con **mocks MSW**
(datos falsos en memoria, en `orion-frontend/src/mocks/`). Para usar el backend
real basta un flag.

**El flag:** `NEXT_PUBLIC_API_MOCK` en `orion-frontend/.env.local`.
- `true` → usa los mocks (no necesita backend).
- `false` → pega al backend real (`NEXT_PUBLIC_API_URL`, por defecto `http://localhost:8080/api/v1`).

> ⚠️ Las variables `NEXT_PUBLIC_*` se leen al **arrancar** `next dev`. Si cambiás
> el `.env.local`, hay que **reiniciar** el server.

**Pasos para pasar a real:**
1. Tener el **backend corriendo** en `:8080` y con los endpoints de ese sprint ya construidos (si no existen, las pantallas fallarán).
2. En `orion-frontend/.env.local` poner `NEXT_PUBLIC_API_MOCK=false` (o arrancar con `NEXT_PUBLIC_API_MOCK=false npm run dev`).
3. Reiniciar `npm run dev`.

**Qué esperar al cambiar:**
- Los **datos de prueba de los mocks desaparecen** (los 6 pedidos eran falsos). La tabla `pedidos` real arranca vacía; los pedidos se crean desde la app y **persisten** en Supabase.
- Los **5 estados** sí están (sembrados por `setup_supabase.sql`).

**Checklist de integración (cuando se conecta un backend nuevo):**
- [ ] El JSON del back respeta el contrato (`orion-backend/files/05b_contrato_sprint2.md` + `05c_contrato_sprint4.md`): snake_case y sobre `ApiResponse` (`{success, data, message}` / `{success:false, error, code}`).
- [ ] El login real incluye `permisos` (para gatear módulos en el front).
- [ ] El interceptor de axios (`src/lib/api.ts`) maneja el **403** además del 401.
- [ ] CORS del back permite `http://localhost:3000` (ya resuelto en Sprint 1).

**Sprint 4 — cambios de contrato a tener en cuenta (ver `orion-frontend/INTEGRACION_FRONT.md`):**
- [ ] Errores ahora con envelope: **401 `AUTH_INVALID`**, **403 `SIN_PERMISO`** (toast, no logout), contraseña actual incorrecta → **400 `VALIDATION`** (no 401), inesperados → **500 `ERROR_INTERNO`**.
- [ ] Dashboard usa **`GET /dashboard/resumen`** (permiso `pedidos.ver`) en vez de derivar KPIs de `listarPedidos({size:200})`.
- [ ] Finanzas usa **`GET /finanzas/kpis`** + el nuevo `desglose_tipo_envio` de `GET /finanzas/resumen`.
- [ ] El panel refresca permisos con **`GET /auth/me`** al entrar.
- [ ] Password mínima **8** al crear usuario (antes 6).

**Volver a mocks:** `NEXT_PUBLIC_API_MOCK=true` y reiniciar.

---

## 🔑 Credenciales de prueba
- **Email:** `joaquin@orionlogistic.com`
- **Password:** `joaquin123` (contraseña actual en la BD de desarrollo)
- Si `password_temporal=true`, el primer login pide cambiar la contraseña (flujo normal).
- El **seed de fábrica** original es `admin123`; el reset de abajo deja el usuario en ese estado.

> ⚠️ **Solo para desarrollo local.** Esta credencial es pública (está en el repo). En
> producción **no** uses este seed: creá un admin real con contraseña fuerte y
> `password_temporal=true`, y desactivá/borrá `joaquin@orionlogistic.com`
> (ver nota en `orion-backend/files/setup_supabase.sql`).

Para resetear el usuario al estado de fábrica, correr en el **SQL Editor de Supabase**:
```sql
UPDATE usuarios
SET password_hash = '$2a$10$iYxuk20ASrzGrkdk5ThRXeIDRKZhP6aLlxJNBMxfypGGtEYEwX7rK',
    password_temporal = true
WHERE email = 'joaquin@orionlogistic.com';
```

El esquema completo de la BD se despliega con `orion-backend/files/setup_supabase.sql` (pegar en el SQL Editor de Supabase).

---

## 🛠️ Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| `Could not resolve placeholder 'JWT_SECRET'` | No hay `.env` (o faltan variables). Crear `orion-backend/api/.env` desde `.env.example`. |
| `Port 8080 was already in use` | Ya hay un backend corriendo. macOS/Linux: `lsof -ti:8080 \| xargs kill -9`. Windows: `Get-NetTCPConnection -LocalPort 8080 \| Select -Expand OwningProcess \| ForEach { Stop-Process -Id $_ -Force }`. |
| `Schema-validation: missing table [...]` | La BD no tiene el esquema. Correr `setup_supabase.sql` en Supabase. |
| `"next" no se reconoce…` | Faltó `npm install` en `orion-frontend`. |
| `Network Error` al cambiar contraseña | Era un bug de CORS (preflight). Ya está arreglado; asegurate de tener el backend actualizado de `testing`. |
| `./mvnw: permission denied` (macOS/Linux) | `chmod +x mvnw` o usar `sh ./mvnw ...`. |
