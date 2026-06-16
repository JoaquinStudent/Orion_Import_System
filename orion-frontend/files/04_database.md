# 04 — Diseño de Base de Datos

> **SDD Orión Logistic** · Documento 4 de 9 · Versión 2.0
> Responsable: José (Backend)

---

## 4.1 Motor y consideraciones

El sistema usa **PostgreSQL** gestionado por Supabase Pro. Elegido por robustez, transacciones, backups automáticos diarios y compatibilidad con Spring Data JPA. Los montos monetarios se almacenan en **USD** con tipo `NUMERIC(10,2)` para evitar errores de punto flotante.

> **Nota de la versión 2.0:** Al simplificar el cotizador, se eliminaron las tablas de tarifas por categoría (iPhone, Laptop) y comunidades. Ahora el cotizador solo usa dos valores de configuración: flete por kilo y desaduanaje.

---

## 4.2 Diagrama Entidad-Relación

```
┌──────────────┐         ┌──────────────┐
│   usuarios   │  1    N │   permisos   │
│──────────────│─────────│──────────────│
│ id (PK)      │         │ id (PK)      │
│ nombre       │         │ usuario_id   │
│ email        │         │ modulo       │
│ password_hash│         │ puede_ver    │
│ rol          │         │ puede_editar │
│ avatar_color │         └──────────────┘
│ activo       │
│ pass_temporal│
└──────┬───────┘
       │ 1 registra N
┌──────▼───────┐         ┌──────────────┐
│   pedidos    │  1    N │  productos   │
│──────────────│─────────│──────────────│
│ id (PK)      │         │ id (PK)      │
│ comunidad    │         │ pedido_id    │
│ titular      │         │ cantidad     │
│ consignatario│         │ producto     │
│ num_orden    │         │ marca        │
│ num_tracking │         └──────────────┘
│ whatsapp     │
│ firma        │         ┌──────────────┐
│ valor_usd    │   N   1 │   estados    │
│ costo_import │─────────│──────────────│
│ estado_id(FK)│         │ id (PK)      │
│ tipo_envio   │         │ nombre       │
│ creado_por   │         │ orden        │
│ creado_en    │         │ color        │
└──────────────┘         └──────────────┘

┌──────────────────────┐
│   configuracion      │   ← flete_por_kilo, desaduanaje,
│──────────────────────│      whatsapp_atencion, nombre_negocio
│ id (PK)              │
│ clave (UNIQUE)       │
│ valor                │
└──────────────────────┘
```

---

## 4.3 Definición de tablas

### Tabla: `usuarios`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre completo |
| email | VARCHAR(150) | NOT NULL, UNIQUE | Correo de acceso |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña cifrada (BCrypt) |
| rol | VARCHAR(20) | NOT NULL | 'ADMIN' o 'EMPLEADO' |
| avatar_color | VARCHAR(7) | DEFAULT '#1B2A5E' | Color hex del avatar |
| activo | BOOLEAN | DEFAULT true | Si el usuario está activo |
| password_temporal | BOOLEAN | DEFAULT true | Si debe cambiar contraseña al ingresar |
| creado_en | TIMESTAMP | DEFAULT now() | Fecha de creación |

### Tabla: `permisos`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| usuario_id | BIGINT | FK → usuarios.id | Empleado al que aplica |
| modulo | VARCHAR(30) | NOT NULL | 'pedidos', 'tablero', 'finanzas', 'cotizador', 'configuracion' |
| puede_ver | BOOLEAN | DEFAULT false | Permiso de visualización |
| puede_editar | BOOLEAN | DEFAULT false | Permiso de edición |

### Tabla: `pedidos`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| comunidad | VARCHAR(100) | | Comunidad del cliente |
| titular | VARCHAR(150) | NOT NULL | Nombre del titular |
| consignatario | VARCHAR(150) | | Destinatario (opcional) |
| num_orden | VARCHAR(50) | NOT NULL, UNIQUE | Número de orden (ORD-XXXXXX) |
| num_tracking | VARCHAR(50) | NOT NULL, UNIQUE | Número de tracking (TRK-XXXXXX) |
| whatsapp | VARCHAR(20) | NOT NULL | WhatsApp del cliente |
| firma | VARCHAR(150) | | Nombre como constancia (solo texto) |
| valor_usd | NUMERIC(10,2) | DEFAULT 0 | Valor del producto (informativo) |
| costo_importacion_usd | NUMERIC(10,2) | NOT NULL | Costo cobrado = ingreso de la empresa |
| estado_id | BIGINT | FK → estados.id | Estado actual del pedido |
| tipo_envio | VARCHAR(30) | | 'almacen', 'lima', 'shalom' (elegido por cliente) |
| creado_por | BIGINT | FK → usuarios.id | Quién registró el pedido |
| creado_en | TIMESTAMP | DEFAULT now() | Fecha de registro |
| actualizado_en | TIMESTAMP | | Última actualización |

### Tabla: `productos`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| pedido_id | BIGINT | FK → pedidos.id | Pedido al que pertenece |
| cantidad | INTEGER | NOT NULL, DEFAULT 1 | Cantidad |
| producto | VARCHAR(200) | NOT NULL | Nombre del producto |
| marca | VARCHAR(100) | | Marca |

### Tabla: `estados`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | NOT NULL | Ej: 'Recibido', 'En tránsito' |
| orden | INTEGER | NOT NULL | Posición en el tablero |
| color | VARCHAR(7) | | Color hex del badge |

> Estados iniciales: Recibido, En tránsito, En aduana, En almacén, Entregado.

### Tabla: `configuracion`

Parámetros globales (clave-valor). Aquí viven los dos valores del cotizador.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGSERIAL | PK | Identificador único |
| clave | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del parámetro |
| valor | VARCHAR(255) | NOT NULL | Valor del parámetro |

**Claves iniciales:**

| clave | valor inicial | descripción |
|-------|---------------|-------------|
| `flete_por_kilo` | `10.00` | Precio del flete por kg (USD) |
| `desaduanaje` | `9.00` | Costo fijo de desaduanaje (USD) |
| `whatsapp_atencion` | `+51...` | WhatsApp de atención al cliente |
| `nombre_negocio` | `Orión Logistic` | Nombre mostrado en la app |
| `umbral_asesor` | `200` | Valor en USD sobre el cual deriva a asesor |

---

## 4.4 Relaciones

- Un **usuario** (empleado) tiene muchos **permisos** (uno por módulo).
- Un **usuario** registra muchos **pedidos**.
- Un **pedido** tiene muchos **productos**.
- Un **pedido** pertenece a un **estado**.
- La tabla **configuracion** alimenta la lógica del cotizador.

---

## 4.5 Índices recomendados

- `idx_pedidos_tracking` sobre `pedidos(num_tracking)` — usado por el rastreador.
- `idx_pedidos_orden` sobre `pedidos(num_orden)` — usado por el rastreador.
- `idx_pedidos_estado` sobre `pedidos(estado_id)` — usado por el tablero.
- `idx_pedidos_fecha` sobre `pedidos(creado_en)` — usado por finanzas.
- `idx_usuarios_email` sobre `usuarios(email)` — usado por login (ya es UNIQUE).

---

## 4.6 Nota sobre el rastreador

El rastreador valida **tracking + orden juntos** para evitar acceso a pedidos ajenos (RNF-05):

```sql
SELECT * FROM pedidos
WHERE num_tracking = :tracking
  AND num_orden = :orden;
```

---

*Anterior: [03 — Arquitectura](03_architecture.md) · Siguiente: [05 — Diseño de la API →](05_api_design.md)*
