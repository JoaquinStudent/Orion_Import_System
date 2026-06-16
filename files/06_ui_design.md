# 06 — Diseño de Interfaces (UI)

> **SDD Orión Logistic** · Documento 6 de 9 · Versión 2.0
> Responsable: Joaquín (Frontend)
> Basado en los prototipos reales de Google Stitch (Panel + Cliente).

---

## 6.1 Design System

Extraído del `DESIGN.md` de los prototipos de Stitch.

### Paleta de colores (Material Design tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| **primary** | `#021449` | Color principal oscuro |
| **primary-container** | `#1B2A5E` | Navy — sidebar, headers, botones primarios |
| **secondary-container** | `#FED65B` / `#D4AF37` | Dorado — acentos, badges activos, montos |
| **surface** | `#FBF8FE` | Fondo general |
| **surface-container-lowest** | `#FFFFFF` | Cards, formularios |
| **surface-container-low** | `#F5F3F8` | Filas alternas, fondos suaves |
| **on-surface** | `#1B1B1F` | Texto principal |
| **on-surface-variant** | `#45464F` | Texto secundario |
| **outline-variant** | `#C6C5D1` | Bordes de inputs y cards |
| **error** | `#BA1A1A` | Errores |

### Tipografía — Inter (única fuente)

| Estilo | Tamaño | Peso | Uso |
|--------|--------|------|-----|
| headline-xl | 28px | 700 | Títulos de página |
| headline-l | 22px | 600 | Títulos de sección |
| headline-m | 18px | 600 | Subtítulos |
| body | 14px | 400 | Texto general |
| caption | 12px | 400 | Etiquetas, ayudas |

> **Regla de mayúsculas (requisito del cliente):** Los titulares de la app pública (hero, título del cotizador, CTAs) van en MAYÚSCULAS. El panel admin usa formato oración normal.

### Componentes base

- **Botón primario**: fondo navy `#1B2A5E`, texto blanco, radius 8px.
- **Botón secundario**: borde navy, texto navy, fondo blanco.
- **Botón WhatsApp**: fondo verde `#25D366`, texto blanco, ícono WA.
- **Input**: borde `#C6C5D1`, radius 8px, focus borde navy.
- **Card**: fondo blanco, borde sutil, radius 12px, padding 20px.

### Badges de estado de pedido

| Estado | Fondo | Texto |
|--------|-------|-------|
| Recibido | `#E6F1FB` | `#0C447C` |
| En tránsito | `#FAEEDA` | `#854F0B` |
| En aduana | `#EEEDFE` | `#3C3489` |
| En almacén | `#E8EDF8` | `#1B2A5E` |
| Entregado | `#E1F5EE` | `#085041` |

---

## 6.2 Mapa de pantallas

### Panel de administración (privado)

| Pantalla | Ruta | Prototipo Stitch |
|----------|------|------------------|
| Login | `/admin/login` | inicio_de_sesion_administrativo |
| Dashboard | `/admin/dashboard` | dashboard_administrativo |
| Registro de pedido | `/admin/pedidos/nuevo` | registro_de_nuevo_pedido |
| Tablero kanban | `/admin/tablero` | tablero_de_pedidos_kanban |
| Finanzas | `/admin/finanzas` | dashboard_de_finanzas |
| Configuración cotizador | `/admin/cotizador` | configuracion_del_cotizador |
| Usuarios y permisos | `/admin/configuracion/usuarios` | gestion_de_usuarios_y_permisos |
| Modal crear empleado | (modal) | modal_crear_nuevo_empleado |
| Asignar permisos | (panel lateral) | asignacion_de_permisos_de_empleado |

### Aplicación del cliente (pública)

| Pantalla | Ruta | Prototipo Stitch |
|----------|------|------------------|
| Landing page | `/` | pagina_de_inicio_publica_servicios_destacados |
| Cotizador paso 1 | `/cotizar` | cotizador_publico_simplificado_paso_1 |
| Cotizador resultado | `/cotizar` | cotizador_publico_resultado_final_simplificado |
| Cotizador asesor | `/cotizar` | cotizador_publico_invitacion_al_asesor_amigable |
| Rastreador búsqueda | `/rastrear` | rastreo_de_pedido_estado_1_busqueda |
| Rastreador resultado | `/rastrear` | rastreo_de_pedido_estado_2_resultados_detallados |
| Rastreador confirmado | `/rastrear` | rastreo_de_pedido_estado_3_confirmado |

---

## 6.3 Layout del panel de administración

```
┌──────────┬─────────────────────────────────────┐
│ SIDEBAR  │  TOPBAR (saludo + notif + avatar)   │
│ (navy)   ├─────────────────────────────────────┤
│          │                                     │
│ Dashboard│         CONTENIDO PRINCIPAL          │
│ Pedidos  │         (fondo #F5F3F8)              │
│ Tablero  │                                     │
│ Finanzas │                                     │
│ Cotizador│                                     │
│ Config   │                                     │
│          │                                     │
│ [usuario]│                                     │
└──────────┴─────────────────────────────────────┘
```

- **Sidebar**: 240px, navy `#1B2A5E`, ítem activo con borde dorado izquierdo. Al fondo: avatar + logout.
- **Topbar**: 60px, blanco, saludo personalizado + fecha + notificaciones + avatar.
- **Contenido**: fondo gris claro, scrollable.

---

## 6.4 Flujo del cotizador público (simplificado)

El cotizador es deliberadamente simple. Solo pide **dos datos**: valor y peso.

### Pantalla 1 — Ingreso de datos
```
COTIZA TU PRÓXIMO ENVÍO
  ↓
[ Valor del producto en USD ]  → detección live: <$200 o >$200
[ Peso del producto en kg ]    → preview del redondeo en vivo
  ↓
[ CALCULAR COSTO DE ENVÍO ]
```

### Pantalla 2 — Resultado (si valor < $200)
```
Desglose:
  Peso cobrado (redondeado ↑)
  Flete (kg × precio por kilo)
  Desaduanaje
  ─────────────────
  Total en dólares
  × tipo de cambio
  ═════════════════
  TOTAL EN SOLES (destacado en dorado)
  ↓
[ Botón WhatsApp ]
```

### Pantalla 3 — Invitación al asesor (si valor > $200)
```
Tono amigable (NO error, NO rojo agresivo):
  Ícono de asesor + título cálido
  "Para este envío te ayudamos personalmente"
  3 chips: Respuesta rápida · Precio exacto · Sin compromiso
  ↓
[ HABLAR CON UN ASESOR ] (WhatsApp verde)
```

> **Regla de tono:** La pantalla de "mayor a $200" debe sentirse como una invitación a recibir ayuda, no como un error. Usa borde dorado en el input (no rojo), ícono de asesor (no triángulo de advertencia) y lenguaje cálido.

---

## 6.5 Flujo del rastreador (3 estados)

```
ESTADO 1: Búsqueda
  Cliente ingresa tracking + orden → botón "Buscar"

ESTADO 2: Resultado
  Resumen del pedido + línea de tiempo de estados +
  selector de tipo de envío (3 opciones)

ESTADO 3: Confirmado
  Card verde de éxito mostrando el tipo de envío elegido
```

La línea de tiempo muestra los estados como pasos horizontales: completados (navy con check), activo (dorado pulsante), pendientes (gris).

---

## 6.6 Regla de privacidad en la landing

> La landing page **NO** debe mostrar las direcciones exactas de los almacenes, teléfonos internos ni horarios de cierre de embarque. Solo información general. El cliente escribe por WhatsApp para recibir la dirección exacta.

---

## 6.7 Configuración del cotizador (admin)

La pantalla de configuración del cotizador tiene **solo dos campos editables**:

- **Flete por kilo** ($/kg) — se multiplica por el peso redondeado.
- **Desaduanaje** ($) — costo fijo por pedido.

Incluye una vista previa en vivo del resumen que verá el cliente y un recordatorio de la regla `<$200` / `>$200`.

---

## 6.8 Responsive

- **Sidebar** → menú hamburguesa en móvil.
- **Tablas** → scroll horizontal o cards apiladas.
- **Cotizador** → los campos se apilan verticalmente.
- **Línea de tiempo del rastreador** → scroll horizontal o lista vertical.

---

## 6.9 Referencia de prototipos

Los prototipos completos en HTML/CSS están en los ZIP exportados de Google Stitch:
- `PanelAdmin_ogistic_design_system.zip` — pantallas del admin.
- `Cliente_logistic_design_system.zip` — pantallas del cliente.

Son la **referencia visual oficial** para Joaquín al construir el frontend. Los prompts que generaron cada pantalla están en el documento [09 — Galería de prompts](09_galeria_prompts.md).

---

*Anterior: [05 — API](05_api_design.md) · Siguiente: [07 — Seguridad →](07_security.md)*
