import type { Config } from "tailwindcss";

/**
 * Design System Orión Logistic (SDD doc 06 + DESIGN.md).
 * - Tokens semánticos de shadcn (primary, secondary, etc.) vía variables RGB en globals.css.
 * - Tokens de marca Material (navy, gold, surface, on-surface...) fieles a los mockups de Stitch.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", lg: "2rem" },
      // Ancho natural por breakpoint y tope de 1200px en desktop (xl+),
      // así el contenido no se estira a todo el ancho en monitores grandes.
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
    },
    extend: {
      colors: {
        // Tokens semánticos shadcn (rgb channels en :root)
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },

        // Marca Orión (Material tokens — fiel a los mockups / DESIGN.md)
        navy: { DEFAULT: "#1B2A5E", dark: "#021449", soft: "#8593CD" },
        gold: { DEFAULT: "#D4AF37", soft: "#FED65B" },
        whatsapp: { DEFAULT: "#25D366", dark: "#1EBE5A" },
        surface: {
          DEFAULT: "#FBF8FE",
          container: "#EFEDF2",
          "container-low": "#F5F3F8",
          "container-lowest": "#FFFFFF",
        },
        "on-surface": { DEFAULT: "#1B1B1F", variant: "#45464F", muted: "#8A93A8" },
        "outline-variant": "#C6C5D1",
      },
      borderRadius: {
        lg: "var(--radius)", // 8px — botones e inputs
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gold": "pulse-gold 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
