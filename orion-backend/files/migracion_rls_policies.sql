-- ============================================================
-- Migración Orión Logistic — Seguridad: políticas RLS deny-all explícitas
-- Correr en el SQL Editor de Supabase. Silencia los 7 avisos INFO del
-- Security Advisor: "RLS Enabled No Policy".
--
-- Contexto: estas 7 tablas tienen RLS activado pero sin políticas declaradas
-- (deny-all IMPLÍCITO). El aviso es nivel INFO, no un agujero: para Orión es el
-- estado correcto, porque la API REST pública de Supabase (PostgREST con la anon
-- key) NO debe acceder a nada. Este script convierte ese deny-all implícito en
-- EXPLÍCITO (política USING(false) para anon/authenticated) → silencia el aviso y
-- documenta la intención en código.
--
-- El backend Java se conecta por JDBC directo como rol owner
-- (postgres.rjynlnveosoofjwhacvo), que BYPASEA RLS, así que NO se ve afectado:
-- mantiene acceso total. El frontend solo habla con el backend, nunca con la
-- anon key de Supabase.
--
-- Idempotente: se puede correr varias veces sin error.
-- ============================================================

-- ---------- 1) Asegurar RLS activado en las 7 tablas ----------
-- (comunidades no estaba en el Bloque 3.5 de setup_supabase.sql; se incluye aquí)
ALTER TABLE public.comunidades   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios      ENABLE ROW LEVEL SECURITY;

-- ---------- 2) Política deny-all explícita por tabla ----------
-- USING(false) niega lectura; WITH CHECK(false) niega escritura. Aplica a los
-- roles expuestos por la API REST de Supabase: anon y authenticated.
-- DROP previo para que el script sea idempotente.

DROP POLICY IF EXISTS "deny_all_api" ON public.comunidades;
CREATE POLICY "deny_all_api" ON public.comunidades
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.configuracion;
CREATE POLICY "deny_all_api" ON public.configuracion
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.estados;
CREATE POLICY "deny_all_api" ON public.estados
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.pedidos;
CREATE POLICY "deny_all_api" ON public.pedidos
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.permisos;
CREATE POLICY "deny_all_api" ON public.permisos
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.productos;
CREATE POLICY "deny_all_api" ON public.productos
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_api" ON public.usuarios;
CREATE POLICY "deny_all_api" ON public.usuarios
    AS PERMISSIVE FOR ALL TO anon, authenticated
    USING (false) WITH CHECK (false);

-- ---------- 3) REVOKE de refuerzo (defensa en profundidad) ----------
-- No es imprescindible (la política ya niega todo), pero quita además los grants
-- de tabla a los roles de la API. El backend (owner) no usa estos grants.
REVOKE ALL ON public.comunidades   FROM anon, authenticated;
REVOKE ALL ON public.configuracion FROM anon, authenticated;
REVOKE ALL ON public.estados       FROM anon, authenticated;
REVOKE ALL ON public.pedidos       FROM anon, authenticated;
REVOKE ALL ON public.permisos      FROM anon, authenticated;
REVOKE ALL ON public.productos     FROM anon, authenticated;
REVOKE ALL ON public.usuarios      FROM anon, authenticated;

-- ---------- 4) Verificación (solo SELECT, no cambia nada) ----------
-- a) Cada tabla debe tener su política deny_all_api sobre {anon, authenticated}.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- b) Confirmar que RLS sigue activo (relrowsecurity = true) en las 7 tablas.
SELECT relname, relrowsecurity
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('comunidades','configuracion','estados','pedidos',
                  'permisos','productos','usuarios')
ORDER BY relname;

-- 5) Tras correr esto, re-ejecutar el Security Advisor:
--    los 7 avisos "RLS Enabled No Policy" deben desaparecer.
