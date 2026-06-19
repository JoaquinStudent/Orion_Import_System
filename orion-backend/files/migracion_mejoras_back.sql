-- ============================================================
-- Migración Orión Logistic — Mejoras de negocio (post-Sprint 4, doc 05d)
-- Correr en el SQL Editor de Supabase ANTES de levantar el backend
-- (ddl-auto=validate exige que el esquema ya exista). Es idempotente.
-- ============================================================

-- 1) El costo de importación pasa a ser opcional al crear el pedido
--    (se carga normalmente cuando el pedido llega al almacén).
ALTER TABLE pedidos
    ALTER COLUMN costo_importacion_usd DROP NOT NULL;

-- 2) Timestamp de entrega: se sella cuando el pedido entra al estado final.
--    Base del archivado de entregados (GET /tablero y GET /pedidos?archivados=true).
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS entregado_en TIMESTAMPTZ;

-- 3) Config del archivado: días desde la entrega tras los que el pedido se archiva
--    (se oculta del tablero). Default 7. Editable por el admin en PUT /admin/config.
INSERT INTO configuracion (clave, valor) VALUES
    ('dias_archivo_entregados', '7')
ON CONFLICT (clave) DO NOTHING;
