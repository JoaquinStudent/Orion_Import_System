-- ============================================================
-- Migración Orión Logistic — Comunidades (catálogo) + estado de pago
-- Correr en el SQL Editor de Supabase ANTES de levantar el backend
-- (ddl-auto=validate exige que el esquema ya exista). Es idempotente.
-- ============================================================

-- 1) Catálogo de comunidades (para el combobox del alta de pedido)
CREATE TABLE IF NOT EXISTS comunidades (
    id     BIGSERIAL    PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN      DEFAULT true
);

INSERT INTO comunidades (nombre) VALUES
    ('Comunidad Norte'),
    ('Comunidad Centro'),
    ('Comunidad Sur')
ON CONFLICT (nombre) DO NOTHING;

-- 2) Estado de pago de la importación en pedidos (pendiente | liquidado)
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) NOT NULL DEFAULT 'pendiente';

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_pago_check;
ALTER TABLE pedidos
    ADD CONSTRAINT pedidos_estado_pago_check CHECK (estado_pago IN ('pendiente', 'liquidado'));
