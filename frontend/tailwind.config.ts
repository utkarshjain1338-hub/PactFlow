/**
 * PactFlow — Constellation of Trust Design System
 * Tailwind CSS Configuration (v3/v4 compatibility & IDE intellisense bridge)
 *
 * All values map directly to our master design tokens defined in `src/styles/design-tokens.css`.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-normal)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-snug)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-tight)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-none)" }],
        "5xl": ["var(--text-5xl)", { lineHeight: "var(--leading-none)" }],
        "6xl": ["var(--text-6xl)", { lineHeight: "var(--leading-none)" }],
      },
      colors: {
        // ── Brand Primary Scale ──
        brand: {
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
          200: "var(--color-brand-200)",
          300: "var(--color-brand-300)",
          400: "var(--color-brand-400)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
          800: "var(--color-brand-800)",
          900: "var(--color-brand-900)",
          950: "var(--color-brand-950)",
        },
        // ── Accent Emerald Scale (Trust Escrow) ──
        accent: {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
          950: "var(--color-accent-950)",
        },
        // ── Surface Scale (Space Dark Mode) ──
        surface: {
          ground: "var(--color-surface-ground)",
          0: "var(--color-surface-0)",
          1: "var(--color-surface-1)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
          overlay: "var(--color-surface-overlay)",
        },
        // ── Border & Text Tokens ──
        "border-subtle": "var(--color-border-subtle)",
        "border-default": "var(--color-border-default)",
        "border-strong": "var(--color-border-strong)",
        "border-brand": "var(--color-border-brand)",
        "border-focus": "var(--color-border-focus)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-disabled": "var(--color-text-disabled)",
        "text-inverse": "var(--color-text-inverse)",

        // ── Status Tokens ──
        status: {
          success: "var(--color-status-success)",
          "success-bg": "var(--color-status-success-bg)",
          "success-border": "var(--color-status-success-border)",
          warning: "var(--color-status-warning)",
          "warning-bg": "var(--color-status-warning-bg)",
          "warning-border": "var(--color-status-warning-border)",
          error: "var(--color-status-error)",
          "error-bg": "var(--color-status-error-bg)",
          "error-border": "var(--color-status-error-border)",
          info: "var(--color-status-info)",
          "info-bg": "var(--color-status-info-bg)",
          "info-border": "var(--color-status-info-border)",
        },

        // ── Milestone States ──
        ms: {
          draft: "var(--color-ms-draft)",
          funded: "var(--color-ms-funded)",
          "in-progress": "var(--color-ms-in-progress)",
          submitted: "var(--color-ms-submitted)",
          paid: "var(--color-ms-paid)",
          refunded: "var(--color-ms-refunded)",
        },

        // ── shadcn/ui Semantic Variables Bridge ──
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      spacing: {
        0.5: "var(--space-0-5)",
        1.5: "var(--space-1-5)",
        2.5: "var(--space-2-5)",
        3.5: "var(--space-3-5)",
        18: "var(--spacing-18)",
        22: "var(--spacing-22)",
        68: "var(--spacing-68)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        "4xl": "2rem",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        brand: "var(--shadow-brand)",
        "brand-lg": "var(--shadow-brand-lg)",
        accent: "var(--shadow-accent)",
        glow: "var(--shadow-glow)",
      },
      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
      transitionTimingFunction: {
        default: "var(--ease-default)",
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
        bounce: "var(--ease-bounce)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { left: "200%" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--ease-out)",
        "fade-up": "fade-up var(--duration-slow) var(--ease-out)",
        "slide-in-right": "slide-in-right var(--duration-slow) var(--ease-out)",
        "slide-in-left": "slide-in-left var(--duration-slow) var(--ease-out)",
        "scale-in": "scale-in var(--duration-normal) var(--ease-out)",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
