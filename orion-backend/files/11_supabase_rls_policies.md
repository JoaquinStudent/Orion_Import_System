# 11 — Políticas RLS de Supabase (aviso `RLS Enabled No Policy`)

> **SDD Orión Logistic** · Anexo de seguridad · Versión 1.0
> Responsable: José (Backend)
> Migración asociada: [`migracion_rls_policies.sql`](migracion_rls_policies.sql)

---

## 11.1 Qué dice el aviso

El **Security Advisor** de Supabase muestra 7 avisos con el nombre
`rls_enabled_no_policy`:

> *"Table `public.<tabla>` has RLS enabled, but no policies exist."*

Tablas afectadas:

| Tabla | Qué contiene |
|-------|--------------|
| `comunidades` | Catálogo de comunidades (combobox de pedidos) |
| `configuracion` | Parámetros del cotizador (flete, desaduanaje, WhatsApp...) |
| `estados` | Estados del tablero kanban |
| `pedidos` | Pedidos de importación |
| `permisos` | Permisos por módulo de cada empleado |
| `productos` | Productos de cada pedido |
| `usuarios` | Usuarios del panel (incluye `password_hash`) |

**Nivel: `INFO`**, no `WARN` ni `ERROR`. Es informativo: avisa que activaste
*Row Level Security* (RLS) en una tabla pero **no declaraste ninguna política**.

---

## 11.2 Por qué en Orión esto NO es una vulnerabilidad

Tu analogía era la de *"una caja fuerte sin la clave de seguridad, desprotegida"*.
En realidad, para esta arquitectura está **al revés en el buen sentido**:

> **RLS activado + sin políticas = la caja fuerte SÍ está cerrada.**
> En PostgreSQL, una tabla con RLS activado y **cero** políticas niega **todo** por
> defecto (*default-deny*) a los roles que pasan por RLS. La API REST pública de
> Supabase (PostgREST, que usa la `anon key`) no puede leer ni escribir nada.

El aviso INFO solo señala que ese *deny-all* es **implícito** (no hay ninguna política
escrita que lo deje documentado). No hay un agujero.

**Dos razones por las que el backend no se ve afectado:**

1. **El backend entra como rol *owner* y BYPASEA RLS.** Spring Boot se conecta por
   **JDBC directo** con el usuario `postgres.rjynlnveosoofjwhacvo` (ver `api/.env`,
   variable `DATABASE_URL`). Ese rol es dueño de las tablas y **ignora RLS por completo**
   → mantiene acceso total sin importar las políticas.

2. **El frontend nunca usa la `anon key` de Supabase.** El front (Next.js) solo habla con
   el backend vía REST + JWT (ver `03_architecture.md` §3.5). Nadie llama a la API REST de
   Supabase directamente. Por eso queremos que esa puerta esté **cerrada con llave**.

Esto ya estaba pensado: en `setup_supabase.sql` (Bloque 3.5) se activó RLS justamente
para que la API pública de Supabase quedara en *deny-all*, protegiendo en particular
`usuarios.password_hash` de quedar accesible vía `anon key`.

---

## 11.3 La solución: deny-all explícito

Convertimos el *deny-all implícito* en **explícito**, creando en cada tabla una política
que niega todo a los roles de la API (`anon` y `authenticated`):

```sql
CREATE POLICY "deny_all_api" ON public.<tabla>
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);
```

- `USING (false)` → niega **lectura** (SELECT/UPDATE/DELETE no ven ninguna fila).
- `WITH CHECK (false)` → niega **escritura** (INSERT/UPDATE no pueden insertar nada).
- `TO anon, authenticated` → aplica solo a los roles expuestos por la API REST de
  Supabase. **No** toca al rol *owner* del backend.

**Esto logra dos cosas:**

1. **Silencia los 7 avisos** del Security Advisor (ya existe una política declarada).
2. **Documenta la intención** en código: queda escrito explícitamente que la API pública
   de Supabase no debe acceder a estas tablas.

Como **refuerzo** (defensa en profundidad), la migración también hace
`REVOKE ALL ... FROM anon, authenticated` sobre cada tabla. No es imprescindible —la
política ya niega todo— pero quita además los permisos de tabla a esos roles.

> ⚠️ El backend **no se ve afectado** por nada de esto: entra como *owner* y bypasea RLS.

---

## 11.4 Cómo aplicarlo

1. Abrí el **SQL Editor** de Supabase.
2. Pegá el contenido completo de [`migracion_rls_policies.sql`](migracion_rls_policies.sql)
   y ejecutalo. (Es idempotente: se puede correr varias veces sin error.)
3. Re-ejecutá el **Security Advisor**. Los 7 avisos `RLS Enabled No Policy` deben
   desaparecer.
4. Verificá que el backend sigue funcionando normal (login + listar pedidos): no debe
   cambiar nada, porque entra como *owner*.

---

## 11.5 Verificación

Los dos queries de comprobación están al final de la migración (solo `SELECT`, no cambian
nada):

```sql
-- a) Cada tabla debe tener su política deny_all_api sobre {anon, authenticated}
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- b) Confirmar que RLS sigue activo (relrowsecurity = true)
SELECT relname, relrowsecurity
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('comunidades','configuracion','estados','pedidos',
                  'permisos','productos','usuarios')
ORDER BY relname;
```

Esperado: las 7 políticas `deny_all_api` listadas, y `relrowsecurity = true` en las 7
tablas.

---

## 11.6 Si algún día el front usa la `anon key`

Hoy **todo pasa por el backend**, así que *deny-all* total es lo correcto. Si en el futuro
el frontend llamara directamente a Supabase con la `anon key` (sin pasar por el backend),
habría que **reemplazar** la política `deny_all_api` de las tablas que correspondan por
políticas **permisivas selectivas**. Por ejemplo, lectura pública de catálogos no
sensibles:

```sql
-- EJEMPLO (no aplicar hoy): permitir solo lectura pública de estados
DROP POLICY IF EXISTS "deny_all_api" ON public.estados;
CREATE POLICY "estados_lectura_publica" ON public.estados
    AS PERMISSIVE FOR SELECT TO anon
    USING (true);
```

Tablas como `usuarios`, `permisos` y `pedidos` **nunca** deberían exponerse a `anon`
(contienen datos sensibles). Mientras tanto, eso queda fuera de alcance.

---

> **Nota:** este anexo atiende el aviso `rls_enabled_no_policy`. El otro aviso de
> seguridad (función `SECURITY DEFINER` ejecutable por `anon`) se atiende en
> [`migracion_seguridad_rls.sql`](migracion_seguridad_rls.sql), que es independiente.

---

*Relacionado: [07 — Seguridad y roles](07_security.md) · [04 — Base de datos](04_database.md) · [10 — Scripts SQL Supabase](10_supabase_sql.md)*
