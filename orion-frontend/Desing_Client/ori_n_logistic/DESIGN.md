---
name: Orión Logistic
colors:
  surface: '#fbf8fe'
  surface-dim: '#dbd9de'
  surface-bright: '#fbf8fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f8'
  surface-container: '#efedf2'
  surface-container-high: '#e9e7ec'
  surface-container-highest: '#e4e1e7'
  on-surface: '#1b1b1f'
  on-surface-variant: '#45464f'
  inverse-surface: '#303034'
  inverse-on-surface: '#f2f0f5'
  outline: '#767680'
  outline-variant: '#c6c5d1'
  surface-tint: '#4e5c92'
  primary: '#021449'
  on-primary: '#ffffff'
  primary-container: '#1b2a5e'
  on-primary-container: '#8593cd'
  inverse-primary: '#b7c4ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#2c1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b2300'
  on-tertiary-container: '#c5885b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#05164b'
  on-primary-fixed-variant: '#354479'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#fcb887'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6a3b15'
  background: '#fbf8fe'
  on-background: '#1b1b1f'
  surface-variant: '#e4e1e7'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-l:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-m:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-strong:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  sidebar_width: 240px
  topbar_height: 60px
  max_width_public: 1200px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for **Orión Logistic**, a premier Peruvian courier and international cargo firm. The brand personality is rooted in reliability, precision, and institutional strength, mirroring the authoritative nature of global logistics and customs. 

The aesthetic is **Corporate Modern**, drawing inspiration from high-performance productivity tools like Linear and Notion, combined with the utilitarian efficiency of global logistics leaders. It prioritizes clarity over decoration, using a structured layout to manage complex data—such as tracking numbers, customs statuses, and shipping manifests—with ease. The visual language is intentionally "un-designed" to feel functional and trustworthy, avoiding gradients or heavy shadows in favor of crisp lines and a strict logical hierarchy.

## Colors

The palette is anchored by **Navy Blue (#1B2A5E)**, representing the maritime and aerial routes of international trade. This primary color is used for structural elements like sidebars and headers to provide a sense of stability. **Gold (#D4AF37)** is used sparingly as a high-value accent for critical information, such as shipment totals, premium statuses, and active navigation states.

Functional colors follow international standards for logistics:
- **Success (Green):** Finalized deliveries and cleared customs.
- **Warning (Amber):** Items in transit or pending documentation.
- **Error (Red):** Canceled shipments or security alerts.

Neutral tones facilitate a tiered information architecture, using a light gray surface for the page background to make white content cards "pop" without requiring heavy shadows.

## Typography

The design system utilizes **Inter** exclusively. Its high x-height and technical grotesque nature make it ideal for data-heavy logistics interfaces. 

- **Headlines:** Use Navy Blue (#1B2A5E) to maintain brand presence and provide clear section anchors.
- **Body Text:** Rendered in Dark Gray (#3D4B6B) for optimal readability against white backgrounds.
- **Micro-copy:** Captions and placeholders use Muted Gray (#8A93A8) to reduce visual noise in dense forms.
- **Alignment:** Numbers (tracking IDs, weights, costs) should use tabular lining where possible to ensure columns align perfectly in tables.

## Layout & Spacing

The layout is built on a **8px base unit**, ensuring mathematical consistency across all margins and paddings. 

### Admin Environment
A fixed **240px Sidebar** persists on the left, housing the primary navigation. The **60px Topbar** handles breadcrumbs and user profile actions. The main content area utilizes a fluid grid with a minimum margin of 32px on desktop, adapting to the viewport.

### Public Environment
Content is centered with a **1200px maximum width** to ensure readability of tracking forms and service information on large displays.

### Grid & Reflow
- **Desktop:** 12-column grid.
- **Tablet:** 8-column grid with a 24px gutter.
- **Mobile:** 4-column grid with 16px margins; sidebar collapses into a hamburger menu.

## Elevation & Depth

This design system avoids physical metaphors and depth-mimicking shadows. Instead, it uses **Tonal Layering** and **Fine Outlines**:

- **Level 0 (Background):** Surface Light Gray (#F4F6FA). Used for the foundation of the application.
- **Level 1 (Cards/Content):** Pure White (#FFFFFF) with a 1px solid border (#E2E6EE).
- **Shadows:** A single, very subtle shadow level is permitted for cards: `0 2px 8px rgba(0,0,0,0.06)`. This is used to slightly lift the content from the background without creating a "floating" effect.
- **Interactive States:** Depth is communicated through color shifts (e.g., a button becoming 10% darker on hover) rather than increased shadow.

## Shapes

The shape language is disciplined and professional. 
- **Small Elements:** Buttons and Input fields use an **8px radius** to provide a modern, approachable feel while maintaining a corporate edge.
- **Container Elements:** Cards and Modals use a **12px radius** to clearly define large content areas.
- **Badges:** Use a pill-shape (fully rounded) for status indicators to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Navy Blue (#1B2A5E) background, White text.
- **Secondary:** White background, Navy Blue border and text.
- **Accent:** Gold (#D4AF37) background, White text. Reserved for "Pay" or "Upgrade" actions.
- **Danger:** Red (#E24B4A) background, White text.

### Inputs
Text fields feature a 1px border (#E2E6EE). Upon focus, the border color changes to Navy Blue (#1B2A5E), but **no outer glow or shadow** is applied.

### Sidebar
The background is strictly Navy Blue (#1B2A5E). Active navigation items are highlighted with a **4px solid Gold (#D4AF37) left border** and a subtle opacity shift in the background.

### Status Badges
Badges use a "soft-fill" approach: a pale version of the status color for the background with high-contrast text.
- **Recibido/En almacén:** Gray tint.
- **En tránsito:** Amber tint.
- **En aduana:** Navy tint.
- **Entregado:** Green tint.

### Data Tables
Use a "Zebra" stripe pattern with the Surface color (#F4F6FA) on even rows. Headers must be Navy Blue (#1B2A5E) text with a 1px bottom border.