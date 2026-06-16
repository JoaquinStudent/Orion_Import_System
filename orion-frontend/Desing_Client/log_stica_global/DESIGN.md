---
name: Logística Global
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
  display-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for **Orión Logistic**, a Peruvian courier and import firm. The brand personality is rooted in reliability, precision, and institutional trust, reflecting a bridge between international commerce and local delivery. 

The visual style is **Corporate Modern**, drawing inspiration from high-performance productivity tools. It prioritizes clarity and efficiency through a systematic layout, ample whitespace, and a sophisticated color palette. The aesthetic response should be one of "effortless logistics"—where complex data (tracking, customs, weights) is presented with absolute legibility and a sense of calm authority.

## Colors

The palette is anchored by **Navy (#1B2A5E)**, representing stability and the corporate identity of a logistics leader. **Gold (#D4AF37)** is used sparingly as an accent to denote premium services, calls to action, or critical status updates (e.g., "In Customs"). 

Surface colors are tiered to create a clean workspace:
- **Background:** Pure white for main content areas to ensure maximum readability.
- **Surface:** A cool grey-blue tint for sidebars, headers, and secondary containers to provide subtle contrast.
- **Muted/Border:** Neutral tones that define the grid without creating visual noise.

## Typography

This design system utilizes **Inter** exclusively to achieve a functional, systematic, and utilitarian feel. The typographic hierarchy is tight and disciplined, favoring smaller, highly legible sizes suitable for data-dense applications.

- **Headings:** Use tight letter-spacing and heavier weights to maintain a strong hierarchy against body text.
- **Body:** Set at 14px for optimal balance between information density and readability in tracking tables and forms.
- **Captions/Labels:** Used for metadata (tracking numbers, timestamps, weights). Use the `label-sm` variant in uppercase for technical category headers.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop views to maintain the structured feel of a professional dashboard, transitioning to a fluid model for mobile.

- **Desktop:** 12-column grid with 16px gutters. Main content area capped at 1280px.
- **Sidebar:** Fixed at 240px to ensure navigation is always accessible for frequent tool-switching.
- **Spacing Rhythm:** Based on a 4px scale. Components typically use 8px (sm) or 16px (md) internal padding to maintain a compact, "pro-tool" density.
- **Mobile:** Margins shrink to 16px. Multi-column forms reflow to a single column to ensure input ease-of-use on the go.

## Elevation & Depth

This design system uses **Tonal Layering** combined with ultra-subtle shadows to define depth. Instead of heavy shadows, depth is communicated through background color shifts (Surface vs. Background).

- **Flat Layer:** Default background state.
- **Raised Layer:** Used for cards and primary containers. Elevated by a 1px border (`#E2E6EE`) and a very soft ambient shadow: `0 2px 8px rgba(0,0,0,0.06)`.
- **Overlay Layer:** Used for dropdowns and modals. These use the same soft shadow but add a secondary 4px blur to indicate higher z-index placement.
- **Interactions:** Hover states on interactive elements (list items, buttons) should trigger a subtle background color shift to `#F4F6FA` rather than an elevation change.

## Shapes

The shape language is disciplined and consistent. An **8px (0.5rem) radius** is the standard for almost all UI elements, including buttons, input fields, and cards. This provides a modern, approachable feel without sacrificing the professional "corporate" edge.

- **Small elements (Checkboxes):** 4px radius.
- **Standard elements (Buttons/Inputs):** 8px radius.
- **Large containers (Modals):** 12px radius for a softer, distinct appearance.

## Components

### Buttons
- **Primary:** Navy background, white text. No shadow.
- **Secondary:** White background, Navy border (1px), Navy text.
- **Ghost:** No border or background; text only. Used for secondary actions in headers.

### Input Fields
- **Default:** 1px border (`#E2E6EE`), 8px radius, white background. 14px text.
- **Focus:** 1px Navy border with a 2px soft Navy outer glow (low opacity).
- **Labels:** Always positioned above the input in `label-md` style, Navy text.

### Chips / Tags
- Used for package status (e.g., *En Camino*, *Entregado*, *Retenido*).
- Small 12px text, semi-bold.
- Subtle background tints based on status (e.g., Light Green for Delivered, Light Gold for In Customs).

### Tables & Lists
- High-density layouts. 
- Row hover states use the Surface color (`#F4F6FA`).
- Tracking numbers should be highlighted in Navy semi-bold for quick scanning.

### Cards
- Used to wrap shipment summaries.
- 1px border (`#E2E6EE`) with the standard 8px radius and the designated subtle shadow.