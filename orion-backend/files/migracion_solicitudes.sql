-- ============================================================
-- Migración Orión Logistic — Registro público de pedidos (solicitudes)
-- Correr en el SQL Editor de Supabase ANTES de levantar el backend
-- (ddl-auto=validate exige que el esquema ya exista). Es idempotente.
--
-- Los clientes registran su pedido desde la landing. Cae en `solicitudes`
-- (separada de `pedidos`) y queda 'pendiente' hasta que el staff la aprueba,
-- recién entonces se crea el Pedido real. Así nada sin revisar llega al
-- tablero ni a finanzas.
-- ============================================================

CREATE TABLE IF NOT EXISTS solicitudes (
    id              BIGSERIAL      PRIMARY KEY,
    titular         VARCHAR(150)   NOT NULL,
    comunidad       VARCHAR(100)   NOT NULL,
    consignatario   VARCHAR(150),
    firma           VARCHAR(150),
    num_orden       VARCHAR(50)    NOT NULL,
    num_tracking    VARCHAR(50)    NOT NULL,
    whatsapp        VARCHAR(20)    NOT NULL,
    valor_usd       NUMERIC(10,2)  DEFAULT 0,
    productos       JSONB          NOT NULL DEFAULT '[]',  -- transitorio: se normaliza al aprobar
    estado          VARCHAR(20)    NOT NULL DEFAULT 'pendiente'
                                   CHECK (estado IN ('pendiente','aprobada','rechazada')),
    ip              VARCHAR(45),
    creado_en       TIMESTAMPTZ    DEFAULT now(),
    revisado_por    BIGINT         REFERENCES usuarios(id) ON DELETE SET NULL,
    revisado_en     TIMESTAMPTZ
);

-- Bandeja de revisión: filtra por estado y ordena por antigüedad.
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado_fecha
    ON solicitudes (estado, creado_en);

-- Tope diario del registro público (anti-spam). Editable por el admin.
INSERT INTO configuracion (clave, valor) VALUES
    ('limite_solicitudes_dia', '50')
ON CONFLICT (clave) DO NOTHING;
