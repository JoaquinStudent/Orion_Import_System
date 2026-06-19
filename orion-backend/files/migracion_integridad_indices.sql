-- ============================================================
-- Migración Orión Logistic — Integridad referencial + índices de escalabilidad
-- Correr en el SQL Editor de Supabase. Idempotente.
--
-- Contexto: la BD viva divergió de setup_supabase.sql (se creó desde una versión
-- previa del esquema). Faltan FKs/cascades y hay una inconsistencia de tipo en
-- entregado_en. Este script re-sincroniza la integridad y agrega los índices que
-- aceleran el archivado y las sumas de finanzas.
-- ============================================================

-- ---------- 1) Integridad referencial ----------

-- productos.pedido_id: FK faltante en la BD viva → permite productos huérfanos.
-- Postgres valida las filas existentes al crear la FK: hay que limpiar los huérfanos
-- (productos cuyo pedido ya no existe) antes, o el ADD CONSTRAINT falla con error 23503.
DELETE FROM productos WHERE pedido_id NOT IN (SELECT id FROM pedidos);
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_pedido_id_fkey;
ALTER TABLE productos ADD CONSTRAINT productos_pedido_id_fkey
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;

-- permisos.usuario_id: al borrar un usuario, borrar sus permisos en cascada.
-- Limpiar primero permisos de usuarios inexistentes.
DELETE FROM permisos WHERE usuario_id NOT IN (SELECT id FROM usuarios);
ALTER TABLE permisos DROP CONSTRAINT IF EXISTS permisos_usuario_id_fkey;
ALTER TABLE permisos ADD CONSTRAINT permisos_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- pedidos: no romper si se borra el estado o el usuario referenciado.
-- La FK es ON DELETE SET NULL → anular las referencias colgadas (en vez de borrar el
-- pedido) antes de crear la FK, si no el ADD CONSTRAINT falla por las filas inválidas.
UPDATE pedidos SET estado_id = NULL
    WHERE estado_id IS NOT NULL AND estado_id NOT IN (SELECT id FROM estados);
UPDATE pedidos SET creado_por = NULL
    WHERE creado_por IS NOT NULL AND creado_por NOT IN (SELECT id FROM usuarios);
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_id_fkey;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_id_fkey
    FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE SET NULL;
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_creado_por_fkey;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_creado_por_fkey
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

-- ---------- 2) Consistencia de tipo ----------

-- entregado_en quedó como timestamptz; el resto de las fechas (creado_en,
-- actualizado_en) son timestamp sin zona, que es el mapeo natural de LocalDateTime.
-- Lo alineamos para evitar conversiones de zona horaria en las comparaciones.
ALTER TABLE pedidos
    ALTER COLUMN entregado_en TYPE timestamp without time zone;

-- ---------- 3) Índices de escalabilidad ----------

-- Archivado de entregados: GET /pedidos?archivados=true y la exclusión del tablero
-- filtran por (estado_id final, entregado_en < cutoff).
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_entregado
    ON pedidos(estado_id, entregado_en);

-- Finanzas: las sumas de ingresos liquidados se filtran por (estado_pago, creado_en).

