import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        buddy: {
          DEFAULT: "hsl(var(--buddy))",
          foreground: "hsl(var(--buddy-foreground))",
        },
        "user-bubble": {
          DEFAULT: "hsl(var(--user-bubble))",
          foreground: "hsl(var(--user-bubble-foreground))",
        },
        correction: {
          DEFAULT: "hsl(var(--correction))",
          foreground: "hsl(var(--correction-foreground))",
          border: "hsl(var(--correction-border))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "bounce-dots": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        // Head movements
        "head-speak": {
          "0%, 100%": { transform: "rotate(0deg) translateY(0)" },
          "15%": { transform: "rotate(0.8deg) translateY(-1px)" },
          "30%": { transform: "rotate(-0.5deg) translateY(0)" },
          "50%": { transform: "rotate(0.3deg) translateY(-1px)" },
          "70%": { transform: "rotate(-0.8deg) translateY(0)" },
          "85%": { transform: "rotate(0.5deg) translateY(-1px)" },
        },
        "head-nod": {
          "0%, 100%": { transform: "rotate(0deg) scale(1.05)" },
          "30%": { transform: "rotate(2deg) scale(1.06)" },
          "60%": { transform: "rotate(-1deg) scale(1.05)" },
        },
        "head-tilt-right": {
          "0%, 100%": { transform: "rotate(0deg) translateY(0)" },
          "50%": { transform: "rotate(3deg) translateY(-2px)" },
        },
        "head-tilt-left": {
          "0%, 100%": { transform: "rotate(0deg) translateY(0)" },
          "50%": { transform: "rotate(-2deg) translateY(-1px)" },
        },
        // Eye animations
        "blink-natural": {
          "0%, 94%, 100%": { opacity: "0" },
          "95%, 98%": { opacity: "1" },
        },
        "eyes-bright": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.15)", opacity: "0.5" },
        },
        "eyebrow-raise": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        // Mouth / lip-sync
        "lip-sync": {
          "0%": { transform: "scaleY(0.3) scaleX(1)" },
          "10%": { transform: "scaleY(1) scaleX(0.85)" },
          "20%": { transform: "scaleY(0.4) scaleX(1.1)" },
          "30%": { transform: "scaleY(0.9) scaleX(0.9)" },
          "40%": { transform: "scaleY(0.2) scaleX(1)" },
          "50%": { transform: "scaleY(0.8) scaleX(0.95)" },
          "60%": { transform: "scaleY(0.5) scaleX(1.05)" },
          "70%": { transform: "scaleY(1) scaleX(0.85)" },
          "80%": { transform: "scaleY(0.3) scaleX(1)" },
          "90%": { transform: "scaleY(0.7) scaleX(0.95)" },
          "100%": { transform: "scaleY(0.3) scaleX(1)" },
        },
        "mouth-subtle": {
          "0%, 100%": { transform: "scaleY(0.5) scaleX(1)" },
          "30%": { transform: "scaleY(0.8) scaleX(0.95)" },
          "60%": { transform: "scaleY(0.6) scaleX(1.05)" },
        },
        smile: {
          "0%, 100%": { transform: "scaleX(1) scaleY(1)" },
          "50%": { transform: "scaleX(1.05) scaleY(1.1)" },
        },
        "smile-wide": {
          "0%, 100%": { transform: "scaleX(1) scaleY(1)" },
          "50%": { transform: "scaleX(1.15) scaleY(1.2)" },
        },
        // Ring pulse
        "ring-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        // Sparkles
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0) translateY(0)" },
          "50%": { opacity: "1", transform: "scale(1) translateY(-6px)" },
        },
        // Waveform
        waveform: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-dots": "bounce-dots 1.4s infinite ease-in-out both",
        "head-speak": "head-speak 2s ease-in-out infinite",
        "head-nod": "head-nod 2.5s ease-in-out infinite",
        "head-tilt-right": "head-tilt-right 3s ease-in-out infinite",
        "head-tilt-left": "head-tilt-left 3s ease-in-out infinite",
        "blink-natural": "blink-natural 4s ease-in-out infinite",
        "eyes-bright": "eyes-bright 2s ease-in-out infinite",
        "eyebrow-raise": "eyebrow-raise 2.5s ease-in-out infinite",
        "lip-sync": "lip-sync 0.4s ease-in-out infinite",
        "mouth-subtle": "mouth-subtle 1.5s ease-in-out infinite",
        smile: "smile 3s ease-in-out infinite",
        "smile-wide": "smile-wide 2s ease-in-out infinite",
        "ring-pulse": "ring-pulse 2s ease-in-out infinite",
        sparkle: "sparkle 1.5s ease-in-out infinite",
        waveform: "waveform 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
