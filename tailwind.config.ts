
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./src2/**/*.{ts,tsx}",
    "./src3/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Template 1 (dark tech). Channels live in CSS variables (src/index.css) so the
        // signal accent can be swapped at runtime for the hidden "overdrive" state.
        darktech: {
          background: 'rgb(var(--t1-bg) / <alpha-value>)',
          lighter: 'rgb(var(--t1-raised) / <alpha-value>)',
          card: 'rgb(var(--t1-card) / <alpha-value>)',
          border: 'rgb(var(--t1-line) / <alpha-value>)',
          'neon-green': 'rgb(var(--t1-signal) / <alpha-value>)',
          'holo-cyan': 'rgb(var(--t1-link) / <alpha-value>)',
          // Easter-egg only — never part of the default palette.
          'cyber-pink': '#ff2e88',
          text: 'rgb(var(--t1-ink) / <alpha-value>)',
          muted: 'rgb(var(--t1-ink-muted) / <alpha-value>)'
        },
        // Template 2 (editorial) — semantic tokens from src2/template2.css
        paper: {
          DEFAULT: 'hsl(var(--background))',
          ink: 'hsl(var(--foreground))',
          muted: 'hsl(var(--muted-foreground))',
          rule: 'hsl(var(--border))',
          accent: 'hsl(var(--primary))',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
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
        "pulse-glow": {
          "0%, 100%": { opacity: "0.8", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.3)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(40, 40, 70, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 40, 70, 0.1) 1px, transparent 1px)'
      },
      fontFamily: {
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'jetbrains': ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        'fraunces': ['Fraunces', 'Georgia', 'serif'],
        'plex-mono': ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    }
  },
  plugins: [animate],
} satisfies Config;
