-- ============================================================
-- Orión Logistic — Setup completo de la BD en Supabase
-- Consolidado de los Scripts 01–10 del doc 10 (en orden de dependencias).
-- Pegar TODO en el SQL Editor de Supabase y ejecutar de una vez.
--
-- Notas:
--  * Se quitaron los comandos \echo del doc (son de psql, no del editor web).
--  * Los DROP ... CASCADE resetean el esquema: úsalo solo en desarrollo.
--  * El usuario admin queda con un hash BCrypt REAL (password: admin123)
--    y password_temporal=true → en el primer login el front pedirá cambiarla.
-- ============================================================

-- ---------- Bloque 1: tablas base ----------

-- Script 01 — estados
DROP TABLE IF EXISTS estados CASCADE;
CREATE TABLE estados (
    id      BIGSERIAL   PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL,
    orden   INTEGER     NOT NULL,
    color   VARCHAR(7)
);

-- Script 02 — configuracion
DROP TABLE IF EXISTS configuracion CASCADE;
CREATE TABLE configuracion (
    id    BIGSERIAL    PRIMARY KEY,
    clave VARCHAR(50)  NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL
);

-- Script 03 — usuarios
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
    id                BIGSERIAL    PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    rol               VARCHAR(20)  NOT NULL CHECK (rol IN ('ADMIN', 'EMPLEADO')),
    avatar_color      VARCHAR(7)   DEFAULT '#1B2A5E',
    activo            BOOLEAN      DEFAULT true,
    password_temporal BOOLEAN      DEFAULT true,
    creado_en         TIMESTAMPTZ  DEFAULT now()
);

-- ---------- Bloque 2: tablas con FK ----------

-- Script 04 — permisos (FK → usuarios)
DROP TABLE IF EXISTS permisos CASCADE;
CREATE TABLE permisos (
    id           BIGSERIAL   PRIMARY KEY,
    usuario_id   BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo       VARCHAR(30) NOT NULL
                             CHECK (modulo IN ('pedidos','tablero','finanzas','cotizador','configuracion')),
    puede_ver    BOOLEAN     DEFAULT false,
    puede_editar BOOLEAN     DEFAULT false,
    UNIQUE (usuario_id, modulo)
);

-- Script 05 — pedidos (FK → estados, usuarios)
DROP TABLE IF EXISTS pedidos CASCADE;
CREATE TABLE pedidos (
    id                    BIGSERIAL      PRIMARY KEY,
    comunidad             VARCHAR(100),
    titular               VARCHAR(150)   NOT NULL,
    consignatario         VARCHAR(150),
    num_orden             VARCHAR(50)    NOT NULL UNIQUE,
    num_tracking          VARCHAR(50)    NOT NULL UNIQUE,
    whatsapp              VARCHAR(20)    NOT NULL,
    firma                 VARCHAR(150),
    valor_usd             NUMERIC(10,2)  DEFAULT 0,
    costo_importacion_usd NUMERIC(10,2)  NOT NULL,
    estado_id             BIGINT         REFERENCES estados(id) ON DELETE SET NULL,
    tipo_envio            VARCHAR(30)    CHECK (tipo_envio IN ('almacen','lima','shalom')),
    estado_pago           VARCHAR(20)    NOT NULL DEFAULT 'pendiente'
                                         CHECK (estado_pago IN ('pendiente','liquidado')),
    creado_por            BIGINT         REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en             TIMESTAMPTZ    DEFAULT now(),
    actualizado_en        TIMESTAMPTZ
);

-- Catálogo de comunidades (combobox del alta de pedido)
DROP TABLE IF EXISTS comunidades CASCADE;
CREATE TABLE comunidades (
    id     BIGSERIAL    PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN      DEFAULT true
);
INSERT INTO comunidades (nombre) VALUES
    ('Comunidad Norte'), ('Comunidad Centro'), ('Comunidad Sur')
ON CONFLICT (nombre) DO NOTHING;

-- Script 06 — productos (FK → pedidos)
DROP TABLE IF EXISTS productos CASCADE;
CREATE TABLE productos (
    id        BIGSERIAL    PRIMARY KEY,
    pedido_id BIGINT       NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cantidad  INTEGER      NOT NULL DEFAULT 1,
    producto  VARCHAR(200) NOT NULL,
    marca     VARCHAR(100)
);

-- ---------- Bloque 3: índices ----------

-- Script 07 — índices de rendimiento
CREATE INDEX idx_pedidos_tracking ON pedidos(num_tracking);
CREATE INDEX idx_pedidos_orden    ON pedidos(num_orden);
CREATE INDEX idx_pedidos_estado   ON pedidos(estado_id);
CREATE INDEX idx_pedidos_fecha    ON pedidos(creado_en);

-- ---------- Bloque 3.5: seguridad (Row Level Security) ----------

-- Habilita RLS en todas las tablas. SIN políticas permisivas, queda default-deny:
-- la API REST/anon de Supabase (PostgREST) no puede leer ni escribir nada
-- (importante: usuarios.password_hash deja de ser accesible vía anon key).
-- El backend Java se conecta con el rol owner/service_role, que BYPASEA RLS,
-- así que mantiene acceso total. Si algún día el front llama a Supabase con la
-- anon key, agregar políticas explícitas por tabla aquí.
ALTER TABLE estados       ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos     ENABLE ROW LEVEL SECURITY;

-- ---------- Bloque 4: datos iniciales (seed) ----------

-- Script 08 — estados iniciales del tablero
INSERT INTO estados (nombre, orden, color) VALUES
    ('Recibido',    1, '#0C447C'),
    ('En tránsito', 2, '#854F0B'),
    ('En aduana',   3, '#3C3489'),
    ('En almacén',  4, '#1B2A5E'),
    ('Entregado',   5, '#085041')
ON CONFLICT DO NOTHING;

-- Script 09 — configuración inicial del cotizador
INSERT INTO configuracion (clave, valor) VALUES
    ('flete_por_kilo',    '10.00'),
    ('desaduanaje',       '9.00'),
    ('whatsapp_atencion', '+51999999999'),
    ('nombre_negocio',    'Orión Logistic'),
    ('umbral_asesor',     '200')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- Script 10 — usuario administrador inicial
-- password: admin123  (hash BCrypt strength 10, generado con spring-security-crypto)
INSERT INTO usuarios (
    nombre,
    email,
    password_hash,
    rol,
    avatar_color,
    activo,
    password_temporal
) VALUES (
    'Joaquín',
    'joaquin@orionlogistic.com',
    '$2a$10$iYxuk20ASrzGrkdk5ThRXeIDRKZhP6aLlxJNBMxfypGGtEYEwX7rK',
    'ADMIN',
    '#D4AF37',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;
