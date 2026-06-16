# 10 — Scripts SQL para Supabase

> **SDD Orión Logistic** · Documento 10 de 10 · Versión 2.0
> Responsable: José (Backend)
> Ejecutar en el **SQL Editor** de Supabase en el orden numerado.

---

## Cómo ejecutar

1. Entrar al proyecto en [supabase.com](https://supabase.com) → **SQL Editor**.
2. Abrir un nuevo query y pegar el script completo.
3. Ejecutar. El mensaje `Script X completado` al final confirma el éxito.
4. Continuar con el siguiente script en orden.

> En desarrollo puedes reejecutar desde el Script 01 si necesitas resetear la base de datos. En producción **no ejecutes los DROP** — comenta esas líneas primero.

---

## Bloque 1 — Tablas base (sin dependencias)

Ejecutar primero. Ninguna de estas tablas depende de otra.

---

### Script 01 — Tabla `estados`

```sql
-- ============================================================
-- Script 01 — Crear tabla: estados
-- Bloque 1: sin dependencias
-- Almacena los estados del tablero kanban (Recibido, Entregado, etc.)
-- ============================================================

DROP TABLE IF EXISTS estados CASCADE;

CREATE TABLE estados (
    id      BIGSERIAL   PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL,
    orden   INTEGER     NOT NULL,
    color   VARCHAR(7)
);

\echo 'Script 01 completado: tabla estados creada';
```

---

### Script 02 — Tabla `configuracion`

```sql
-- ============================================================
-- Script 02 — Crear tabla: configuracion
-- Bloque 1: sin dependencias
-- Almacena pares clave-valor globales (flete, desaduanaje, WhatsApp, etc.)
-- ============================================================

DROP TABLE IF EXISTS configuracion CASCADE;

CREATE TABLE configuracion (
    id    BIGSERIAL    PRIMARY KEY,
    clave VARCHAR(50)  NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL
);

\echo 'Script 02 completado: tabla configuracion creada';
```

---

### Script 03 — Tabla `usuarios`

```sql
-- ============================================================
-- Script 03 — Crear tabla: usuarios
-- Bloque 1: sin dependencias
-- Almacena administradores y empleados del panel admin
-- ============================================================

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
    creado_en         TIMESTAMP    DEFAULT now()
);

\echo 'Script 03 completado: tabla usuarios creada';
```

---

## Bloque 2 — Tablas con FK

Ejecutar después del Bloque 1. Cada script indica de qué depende.

---

### Script 04 — Tabla `permisos`

> Requiere: Script 03 (usuarios)

```sql
-- ============================================================
-- Script 04 — Crear tabla: permisos
-- Bloque 2: FK → usuarios
-- Un registro por módulo por empleado. Solo aplica a EMPLEADO.
-- ============================================================

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

\echo 'Script 04 completado: tabla permisos creada';
```

---

### Script 05 — Tabla `pedidos`

> Requiere: Scripts 01 (estados) y 03 (usuarios)

```sql
-- ============================================================
-- Script 05 — Crear tabla: pedidos
-- Bloque 2: FK → estados, usuarios
-- Tabla central del sistema. Incluye tracking, financiero y tipo de envío.
-- ============================================================

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
    estado_id             BIGINT         REFERENCES estados(id),
    tipo_envio            VARCHAR(30)    CHECK (tipo_envio IN ('almacen','lima','shalom')),
    creado_por            BIGINT         REFERENCES usuarios(id),
    creado_en             TIMESTAMP      DEFAULT now(),
    actualizado_en        TIMESTAMP
);

\echo 'Script 05 completado: tabla pedidos creada';
```

---

### Script 06 — Tabla `productos`

> Requiere: Script 05 (pedidos)

```sql
-- ============================================================
-- Script 06 — Crear tabla: productos
-- Bloque 2: FK → pedidos
-- Detalle de líneas de producto dentro de un pedido (1..N).
-- ============================================================

DROP TABLE IF EXISTS productos CASCADE;

CREATE TABLE productos (
    id        BIGSERIAL    PRIMARY KEY,
    pedido_id BIGINT       NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cantidad  INTEGER      NOT NULL DEFAULT 1,
    producto  VARCHAR(200) NOT NULL,
    marca     VARCHAR(100)
);

\echo 'Script 06 completado: tabla productos creada';
```

---

## Bloque 3 — Índices de rendimiento

Ejecutar después del Bloque 2.

---

### Script 07 — Índices

```sql
-- ============================================================
-- Script 07 — Índices de rendimiento
-- Bloque 3: requiere Scripts 01-06
-- Optimizan las consultas más frecuentes del sistema.
-- ============================================================

-- Rastreador público: busca por tracking + orden juntos
CREATE INDEX idx_pedidos_tracking ON pedidos(num_tracking);
CREATE INDEX idx_pedidos_orden    ON pedidos(num_orden);

-- Tablero kanban: agrupa pedidos por estado
CREATE INDEX idx_pedidos_estado   ON pedidos(estado_id);

-- Finanzas: filtra por rango de fechas
CREATE INDEX idx_pedidos_fecha    ON pedidos(creado_en);

-- Nota: idx_usuarios_email está cubierto por la restricción UNIQUE del Script 03

\echo 'Script 07 completado: 4 índices creados';
```

---

## Bloque 4 — Datos iniciales (seed)

Ejecutar después del Bloque 3. Estos scripts son idempotentes: puedes reejecutarlos sin duplicar datos.

---

### Script 08 — Seed: estados iniciales

```sql
-- ============================================================
-- Script 08 — Seed: estados iniciales del tablero
-- Bloque 4: requiere Script 01
-- Crea los 5 estados por defecto del kanban con sus colores.
-- ============================================================

INSERT INTO estados (nombre, orden, color) VALUES
    ('Recibido',    1, '#0C447C'),
    ('En tránsito', 2, '#854F0B'),
    ('En aduana',   3, '#3C3489'),
    ('En almacén',  4, '#1B2A5E'),
    ('Entregado',   5, '#085041')
ON CONFLICT DO NOTHING;

\echo 'Script 08 completado: 5 estados iniciales insertados';
```

---

### Script 09 — Seed: configuración inicial del cotizador

```sql
-- ============================================================
-- Script 09 — Seed: configuración inicial
-- Bloque 4: requiere Script 02
-- Carga los valores del cotizador y datos del negocio.
-- Usa ON CONFLICT ... DO UPDATE para que sea seguro reejecutar.
-- ============================================================

INSERT INTO configuracion (clave, valor) VALUES
    ('flete_por_kilo',    '10.00'),
    ('desaduanaje',       '9.00'),
    ('whatsapp_atencion', '+51999999999'),
    ('nombre_negocio',    'Orión Logistic'),
    ('umbral_asesor',     '200')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

\echo 'Script 09 completado: configuración inicial insertada';
\echo 'Recuerda actualizar whatsapp_atencion con el número real.';
```

---

### Script 10 — Seed: usuario administrador inicial

> **Antes de ejecutar:** José debe generar el hash BCrypt de la contraseña temporal en Spring Boot y reemplazar el placeholder.
>
> ```java
> // En cualquier clase Spring, inyectar PasswordEncoder y ejecutar:
> String hash = passwordEncoder.encode("TU_PASSWORD_TEMPORAL");
> System.out.println(hash);
> // Copiar el resultado y pegarlo en este script.
> ```

```sql
-- ============================================================
-- Script 10 — Seed: usuario administrador inicial
-- Bloque 4: requiere Script 03
-- INSTRUCCIÓN: reemplaza $2a$10$HASH_AQUI con el hash BCrypt
--              generado por José antes de ejecutar este script.
-- ============================================================

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
    '$2a$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL',   -- ← José genera este valor
    'ADMIN',
    '#D4AF37',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

\echo 'Script 10 completado: usuario admin insertado';
\echo 'IMPORTANTE: Cambiar la contraseña en el primer inicio de sesión.';
```

---

## Resumen de ejecución

| # | Script | Tabla / Acción | Depende de |
|---|--------|----------------|------------|
| 01 | `crear_estados` | Crea `estados` | — |
| 02 | `crear_configuracion` | Crea `configuracion` | — |
| 03 | `crear_usuarios` | Crea `usuarios` | — |
| 04 | `crear_permisos` | Crea `permisos` | Script 03 |
| 05 | `crear_pedidos` | Crea `pedidos` | Scripts 01, 03 |
| 06 | `crear_productos` | Crea `productos` | Script 05 |
| 07 | `crear_indices` | 4 índices en `pedidos` | Scripts 01-06 |
| 08 | `seed_estados` | 5 estados del kanban | Script 01 |
| 09 | `seed_configuracion` | 5 claves del cotizador | Script 02 |
| 10 | `seed_admin` | Usuario ADMIN inicial | Script 03 |

---

*Anterior: [09 — Galería de prompts](09_galeria_prompts.md) · Volver al [índice](00_index.md)*
