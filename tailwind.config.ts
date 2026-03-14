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
        "avatar-speak": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.01) rotate(0.5deg)" },
          "75%": { transform: "scale(1.01) rotate(-0.5deg)" },
        },
        "avatar-think": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        blink: {
          "0%, 96%, 100%": { opacity: "0" },
          "97%, 99%": { opacity: "1" },
        },
        mouth: {
          "0%, 100%": { transform: "scaleY(0.3) scaleX(1)" },
          "25%": { transform: "scaleY(1) scaleX(0.9)" },
          "50%": { transform: "scaleY(0.5) scaleX(1.1)" },
          "75%": { transform: "scaleY(0.8) scaleX(0.95)" },
        },
        waveform: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-dots": "bounce-dots 1.4s infinite ease-in-out both",
        "avatar-speak": "avatar-speak 1.5s ease-in-out infinite",
        "avatar-think": "avatar-think 2s ease-in-out infinite",
        blink: "blink 4s ease-in-out infinite",
        mouth: "mouth 0.3s ease-in-out infinite",
        waveform: "waveform 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
