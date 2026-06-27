-- ============================================================
-- Migración Orión Logistic — Código de comunidad
-- Correr en el SQL Editor de Supabase ANTES de levantar el backend
-- (ddl-auto=validate exige que el esquema ya exista). Es idempotente.
--
-- Reemplaza el listado público de comunidades por un código que el admin
-- asigna por comunidad y comparte con la comunidad indígena. El cliente lo
-- ingresa al registrar un pedido; así no se filtra con qué comunidades
-- trabaja el dueño ni se permite suplantación.
-- ============================================================

-- Código (opcional) por comunidad. Único case-insensitive cuando está cargado.
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS codigo VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS comunidades_codigo_key
    ON comunidades (LOWER(codigo))
    WHERE codigo IS NOT NULL;
