# 09 — Galería de Prompts de Google Stitch

> **SDD Orión Logistic** · Documento 9 de 9 · Versión 2.0
> Responsable: Joaquín (Frontend)
> Compilación de todos los prompts usados para generar las pantallas en Google Stitch.

---

## 9.0 Setup del MCP de Google Stitch

El MCP de Stitch permite enviar prompts directamente desde Claude y recibir el HTML/CSS del prototipo sin copiar y pegar manualmente en el navegador.

### Instalación (ejecutar una sola vez en la terminal)

```bash
claude mcp add stitch \
  --transport http \
  --header "X-Goog-Api-Key: TU_API_KEY_AQUI" \
  https://stitch.googleapis.com/mcp
```

> **Seguridad:** nunca commitees la API key. Guárdala solo en tu terminal o en una variable de entorno local. El comando anterior la deja en la configuración local de Claude Code, no en el repositorio.

### Una sola instancia para ambas apps

No necesitas dos instancias del MCP. El mismo servidor genera pantallas del panel admin y de la app pública. La separación la hacen los prompts que envías, no el MCP en sí.

### Workflow de diseño con MCP

Para cada sesión de pantallas nuevas:

```
1. Enviar System Prompt Base (§9.2)    → define colores, componentes, idioma
2. Enviar Typography Lock (§9.3)        → bloquea la fuente Inter
3. Enviar el prompt de la pantalla      → §9.4 (cliente) o §9.5 (admin)
4. Stitch devuelve HTML/CSS del prototipo
5. Copiar el código o descargar el ZIP para usarlo como referencia visual
```

Los pasos 1 y 2 se envían **una vez por sesión**. Luego puedes iterar con el paso 3 para generar todas las pantallas del mismo grupo.

---

## 9.1 Cómo usar esta galería

Cada pantalla del sistema fue prototipada en **Google Stitch** usando prompts en español/inglés. Para reproducir o ajustar una pantalla, se pegan los prompts en este orden:

```
1. System Prompt Base      (colores, componentes, diseño general)
2. Typography Lock         (bloquea Inter y la regla de mayúsculas)
3. Prompt del screen        (la pantalla específica)
```

Los primeros dos se pegan UNA VEZ al inicio de cada sesión de Stitch. El tercero cambia según la pantalla que se quiera generar.

---

## 9.2 System Prompt Base

> Define la identidad visual de todo el sistema. Pegar primero en cada sesión.

```
You are designing screens for "Orión Logistic", a Peruvian import courier
company (USA Miami → Peru). The design must be corporate, clean, minimal
and trustworthy. No stock photos, no people images — icons and shapes only.

COLOR SYSTEM (Material Design tokens):
  primary:               #021449
  primary-container:     #1B2A5E  (navy — sidebars, headers, primary buttons)
  secondary-container:   #FED65B / #D4AF37  (gold — accents, active badges, totals)
  surface:               #FBF8FE  (general background)
  surface-container-low: #F5F3F8  (alternating rows, soft backgrounds)
  white:                 #FFFFFF  (cards, forms)
  on-surface:            #1B1B1F  (primary text)
  on-surface-variant:    #45464F  (secondary text)
  outline-variant:       #C6C5D1  (borders)
  error:                 #BA1A1A
  WhatsApp green:        #25D366

STATUS BADGES (order states):
  Recibido    → bg #E6F1FB, text #0C447C
  En tránsito → bg #FAEEDA, text #854F0B
  En aduana   → bg #EEEDFE, text #3C3489
  En almacén  → bg #E8EDF8, text #1B2A5E
  Entregado   → bg #E1F5EE, text #085041

COMPONENTS:
  Primary button: navy #1B2A5E bg, white text, radius 8px
  Secondary button: navy border, navy text, white bg
  WhatsApp button: green #25D366 bg, white text, WA icon
  Input: border #C6C5D1, radius 8px, focus border navy
  Card: white bg, subtle border, radius 12px, padding 20px

All UI text in Spanish (Peru). Apply this system to every screen.
```

---

## 9.3 Typography Lock

> Bloquea la tipografía. Stitch tiende a cambiar de fuente entre sesiones — esto lo evita. Pegar después del System Prompt Base.

```
TYPOGRAPHY LOCK — overrides any font decision you would make.

FONT FAMILY — ONE FONT ONLY: "Inter" (Google Fonts).
Weights: 400, 500, 600, 700.
NEVER use: Roboto, Poppins, Montserrat, DM Sans, Nunito, Lato, Raleway,
Open Sans, Outfit, Plus Jakarta Sans, or any other font. Always Inter.

TYPE SCALE:
  Page title (h1):     28px / 700 / #1B2A5E
  Section title (h2):  22px / 600 / #1B2A5E
  Card title (h3):     18px / 600 / #1B2A5E
  Body:                14px / 400 / #3D4B6B / line-height 1.6
  Label:               13px / 500 / #3D4B6B
  Caption:             12px / 400 / #8A93A8
  Overline:            11px / 500 / #8A93A8 / uppercase / letter-spacing 0.08em

UPPERCASE RULE (client requirement):
  ALWAYS uppercase: public app headlines (hero, quoter title, CTA sections),
                    quoter step labels, section overlines, primary public CTAs.
  NEVER uppercase:  body text, descriptions, form labels, admin sidebar items,
                    card subtitles, captions.

COLOR FOR TEXT:
  Primary #1B2A5E · Secondary #3D4B6B · Muted #8A93A8 · Gold accent #D4AF37
  White only on navy bg · Error red only on red bg · Success green only on green bg

Apply automatically to every screen without asking.
```

---

## 9.4 Prompts — Aplicación del cliente

### Landing page

```
Full public landing page for Orión Logistic. Sections:
1. Sticky navbar (logo + links: Cotizar, Rastrear, Servicios, Nosotros + WhatsApp button)
2. Hero (navy bg): uppercase headline "IMPORTAMOS DESDE EE.UU HASTA TU PUERTA",
   subtitle, 2 CTAs (Cotizar ahora / Rastrear pedido), trust indicators.
   Right side: abstract compass illustration, no photos.
3. Stats bar: +1,000 pedidos/mes · 6-12 días · 3 almacenes en Miami · 100% seguro
4. Servicios: 3 cards (iPhones, Laptops/iPads, Otros productos) — icon, title, desc
5. ¿Cómo funciona?: 4 steps (Cotiza, Compra, Embarcamos, Recibe) with dashed connector
6. Almacenes: general info only ("3 almacenes en Miami, Florida"),
   NO exact addresses/phones/schedules. CTA to get address via WhatsApp.
7. CTA final (navy bg): "¿LISTO PARA IMPORTAR?" + Cotizar / WhatsApp buttons
8. Footer (dark navy #0F1E45): 4 columns + legal links + copyright
Floating WhatsApp button fixed bottom-right on all sections.
IMPORTANT: no confidential info (warehouse addresses, internal phones, schedules).
```

### Cotizador — Pantalla 1 (valor + peso)

```
Public Quoter screen 1 — Value + Weight input. Route /cotizar.
ONE simple rule: value under $200 → calculate; value over $200 → WhatsApp advisor.
Client enters only 2 things: product value (USD) + weight (kg).
Weight always rounds UP to next integer (1.3 kg → 2 kg).

Card (white, max-width 600px):
  Title: "COTIZA TU PRÓXIMO ENVÍO" (uppercase, 26px bold navy)
  Live rate pill top-right: green dot + "Dólar: S/ 3.40 · en vivo"
  STEP 1 "VALOR DEL PRODUCTO": large input (USD $ prefix), value "20"
    Live badge: if ≤200 green "✓ Menor a $200", if >200 red "⚠ Mayor a $200"
  STEP 2 "PESO DEL PRODUCTO": large input (KG prefix), value "1.3"
    Rounding preview card: "Peso ingresado 1.3 kg → Peso a cobrar 2 kg ↑"
    Example chips: [0.5→1] [1.3→2 ✓] [2.1→3] [3.0→3]
  CTA: "CALCULAR COSTO DE ENVÍO →" (navy, full width)
  Footer note + WhatsApp button
No categories, no taxes field, no community selector. Two inputs only.
```

### Cotizador — Pantalla 2 (resultado, valor < $200)

```
Public Quoter screen 2 — Result (value under $200). Route /cotizar.
Example: value $20, weight 1.3kg → 2kg charged.

Calculation shown:
  Value $20.00 · Weight 1.3kg · Charged 2kg
  Flete: 2 × $10/kg = $20.00 · Desaduanaje $9.00
  Total USD $29.00 · × S/3.40 · Total PEN S/98.60

Card same style as screen 1:
  Title "COTIZA TU PRÓXIMO ENVÍO" + breadcrumb chips [✓ $20] [✓ 1.3kg→2kg]
  Method badge centered: "✓ EMBARQUE · Valor menor a $200" (green pill)
  Cost breakdown table (value, weight, charged weight, flete, desaduanaje)
  TOTAL ROW: "TOTAL ESTIMADO EN SOLES" + "S/ 98.60" (28px bold gold #D4AF37)
  Rounding note (purple info card explaining the ceiling)
  CTA: "¿LISTO PARA IMPORTAR? ESCRÍBENOS POR WHATSAPP" (green, uppercase)
  Link: "← Calcular otro producto"
```

### Cotizador — Pantalla 3 (asesor, valor > $200)

```
Public Quoter screen 3 — Over $200, friendly advisor invitation. Route /cotizar.
TONE: warm invitation to talk to an expert, NOT an error or warning.
No red backgrounds. No warning triangles. Welcoming and helpful.

Card same style:
  Title "COTIZA TU PRÓXIMO ENVÍO"
  Value input showing "850" with GOLD border (#D4AF37 — signals "special", not error)
  Gold detection badge: "✨ Para este envío te asesoramos personalmente"
  Advisor card (white, navy top border 4px, centered):
    Headset/person icon (NOT warning triangle) in navy circle
    Title: "PARA ESTE ENVÍO TE AYUDAMOS PERSONALMENTE" (uppercase navy)
    Subtitle: warm explanation about >$200 special process
    3 benefit chips: [💬 Respuesta rápida] [🎯 Precio exacto] [✅ Sin compromiso]
  CTA: "HABLAR CON UN ASESOR" (green WhatsApp, full width)
  Note: "Disponible de lunes a sábado · Respuesta en minutos"
  Link: "← Mi producto vale menos de $200 · Calcular costo"
The weight field is hidden on this screen. No calculation, no breakdown.
```

### Rastreador — Estado 1 (búsqueda)

```
Order tracker screen 1 — Search. Route /rastrear.
Centered card: title "RASTREA TU PEDIDO" (uppercase),
two inputs: número de tracking (TRK-XXXXXX) + número de orden (ORD-XXXXXX),
button "BUSCAR MI PEDIDO" (navy). Helper text explaining where to find these numbers.
Validation requires BOTH fields. WhatsApp button at bottom for help.
```

### Rastreador — Estado 2 (resultado + selección de envío)

```
Order tracker screen 2 — Results with timeline. Route /rastrear.
Order summary (titular, productos, comunidad).
Horizontal timeline of states: Recibido → En tránsito → En aduana → En almacén → Entregado.
Completed states navy with check, active state gold pulsing, pending states gray.
Below: shipping type selector — 3 cards: "Recojo en almacén", "Delivery en Lima",
"Provincia por Shalom". Each selectable. Button "CONFIRMAR TIPO DE ENVÍO".
```

### Rastreador — Estado 3 (confirmado)

```
Order tracker screen 3 — Shipping confirmed. Route /rastrear.
Success card (green accent): big check icon, title "¡ENVÍO CONFIRMADO!",
shows the chosen shipping type, summary of what happens next.
WhatsApp button to contact for questions. Link to track another order.
```

---

## 9.5 Prompts — Panel de administración

### Login

```
Admin login — split screen. Route /admin/login.
LEFT (navy #1B2A5E): logo "Orión Logistic", brand description,
stats (+1,000 pedidos/mes, 6-12 días, 3 almacenes), copyright bottom.
RIGHT (light bg): login card with "Bienvenido de vuelta" title,
email input (mail icon), password input (lock icon + eye toggle),
"¿Olvidaste tu contraseña?" link, "Iniciar sesión" button (navy).
Role info note at bottom. Also design an error state (red borders + message).
No social login, no register link. Sentence case (admin panel, not uppercase).
```

### Dashboard

```
Admin dashboard. Route /admin/dashboard.
Sidebar (navy, 240px): Dashboard (active, gold left border), Pedidos, Tablero,
Finanzas, Cotizador, Configuración. User avatar + logout at bottom.
Topbar: "Buenos días, Joaquín 👋" + date + notification bell + avatar.
Main content:
  4 KPI cards: Pedidos hoy (12), En tránsito (47), En aduana (23), Entregados mes (312)
  Recent orders table (tracking, titular, producto, estado badge, monto, WhatsApp icon)
  Ingresos del mes card ($4,280) with 7-day bar chart (gold today's bar)
  Acciones rápidas card (Nuevo pedido, Ver tablero, Exportar Excel)
  Resumen por estado (5 columns with counts and progress bars)
Real data (Carlos Pérez, Ana Torres...), not lorem ipsum. USD amounts. Sentence case.
```

### Registro de pedido

```
New order registration form. Route /admin/pedidos/nuevo.
Fields: comunidad, titular, consignatario (opcional), número de orden (ORD-000000),
número de tracking (TRK-000000), WhatsApp (999 999 999),
product rows (cantidad + producto + marca, add multiple),
valor del producto USD (informativo), costo de importación USD (ingreso),
firma (texto del nombre). Save button + cancel. Sidebar + topbar layout.
```

### Tablero kanban

```
Orders kanban board. Route /admin/tablero.
Columns = order states (Recibido, En tránsito, En aduana, En almacén, Entregado),
each column header with its badge color and order count.
Order cards: tracking, titular, producto, monto. Cards movable between columns.
Button to manage states (add/edit/reorder/delete). Sidebar + topbar layout.
```

### Finanzas

```
Finance dashboard. Route /admin/finanzas.
KPIs: ingreso total del mes (USD), total pedidos, promedio por pedido.
Income chart (day/month/year toggle) in USD. Date range filter.
"Exportar a Excel" button (green). Table of recent income entries.
Only costo de importación counts as income, not product value. Sidebar + topbar.
```

### Configuración del cotizador (simplificada)

```
Quoter configuration. Route /admin/cotizador/configuracion.
ONLY 2 editable fields:
  1. Flete por kilo ($/kg) — input showing "10.00", with rounding examples
  2. Desaduanaje ($) — input showing "9.00", fixed cost note
Live preview card showing the summary the client will see (example $20 + 1.3kg → S/98.60).
Rule reminder: green "< $200 calculate" / red "> $200 advisor".
Sticky footer with "Guardar cambios" button. No categories, no tariff tables.
Sidebar + topbar layout. Sentence case.
```

### Gestión de usuarios y permisos

```
Users management. Route /admin/configuracion/usuarios.
Title "Usuarios del sistema". Grid of user cards:
  Joaquín (Admin · Dueño, gold badge, "Permisos completos — no editables"),
  José (Empleado, gray badge, "Editar permisos" + "Desactivar" links),
  dashed "Agregar empleado" card.
Below: WhatsApp de atención al cliente config (input + save button +
note "Aparece en: Landing, Cotizador, Rastreador").
"Agregar empleado" button top-right. Sidebar + topbar layout.
```

### Modal crear empleado

```
Create employee modal (overlay on Users screen).
Fields: nombre completo, correo electrónico, contraseña temporal (eye toggle),
avatar color (6 swatches). Live avatar preview with initials.
Note: "Los permisos se configuran en el siguiente paso".
Footer: "Cancelar" + "Crear empleado →" buttons.
```

### Asignación de permisos (panel lateral)

```
Permission assignment side panel (slides from right on Users screen).
Employee info header (avatar, name, email, "Empleado · Activo").
Permission matrix — for each module (Pedidos, Tablero, Finanzas, Cotizador,
Configuración) two toggles: Ver / Editar.
Finanzas and Configuración shown restricted by default with explanatory notes.
Access summary card (what the employee CAN and CANNOT do).
Footer: "Cancelar" + "Guardar permisos" buttons.
```

---

## 9.6 Orden de pegado recordatorio

> Para cada pantalla nueva en Stitch:
> 1. System Prompt Base (§9.2) — una vez por sesión
> 2. Typography Lock (§9.3) — una vez por sesión
> 3. El prompt de la pantalla específica (§9.4 o §9.5)

Los prototipos generados están en los ZIP de Stitch entregados con el proyecto.

---

*Anterior: [08b — Plan diario](08b_plan_diario.md) · Volver al [índice](00_index.md)*
