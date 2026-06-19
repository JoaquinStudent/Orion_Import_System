-- ============================================================
-- Migración Orión Logistic — Seguridad: función rls_auto_enable()
-- Correr en el SQL Editor de Supabase. Silencia las 2 advertencias del
-- Security Advisor: "Public/Signed-In Users Can Execute SECURITY DEFINER Function".
--
-- Contexto: public.rls_auto_enable() es SECURITY DEFINER (corre con permisos del
-- owner) y es ejecutable por los roles anon/authenticated vía /rest/v1/rpc/. Eso
-- la hace llamable sin loguearse → escalación de privilegios. No la usa el backend
-- (la función se creó directo en Supabase, no está en el repo).
-- ============================================================

-- 1) Inspección previa (solo SELECT, no cambia nada):
--    a) ¿Existe y es SECURITY DEFINER? (prosecdef = true)
SELECT n.nspname AS schema, p.proname AS funcion, p.prosecdef AS es_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable';

--    b) ¿La referencia algún event trigger? Si la lista sale vacía, la función
--       no se usa y se puede DROPEAR en lugar de solo revocar.
SELECT evtname, evtfoid::regprocedure AS funcion
FROM pg_event_trigger;

-- 2) Fix recomendado: quitar el permiso de ejecución a los roles expuestos por la
--    API REST de Supabase (anon, authenticated) y a PUBLIC. Es seguro aunque la
--    función la dispare un event trigger: los event triggers la ejecutan como
--    owner del trigger y NO dependen del grant EXECUTE a estos roles.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- 3) Alternativa: si el paso 1.b confirmó que NINGÚN event trigger la referencia y
--    nadie más la usa, eliminarla del todo (comentá el REVOKE de arriba y usá esto):
-- DROP FUNCTION IF EXISTS public.rls_auto_enable();

-- 4) Verificación: re-correr el Security Advisor → las 2 advertencias deben
--    desaparecer. Confirmar que ya no hay grants a anon/authenticated:
SELECT grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public' AND routine_name = 'rls_auto_enable';
