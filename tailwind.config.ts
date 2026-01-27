import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Serene Caribbean ocean palette - light, clear, airy
        ocean: {
          50: "#f8fcfc",
          100: "#eef8f8",
          200: "#d9f0f0",
          300: "#b8e3e4",
          400: "#8dd1d3",
          500: "#5fbbc0",
          600: "#47a3a8",
          700: "#3c878c",
          800: "#366d71",
          900: "#305b5f",
          950: "#1c3a3d",
        },
        // Crystal clear water accent
        crystal: {
          50: "#f0fdfb",
          100: "#ccfbf4",
          200: "#9af5ea",
          300: "#5fe9dc",
          400: "#2dd4c8",
          500: "#14b8ad",
          600: "#0d948c",
          700: "#0f7671",
          800: "#115e5b",
          900: "#134e4b",
          950: "#042f2e",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["4rem", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "300" }],
        "display-lg": ["3.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "300" }],
        "display": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "300" }],
        "heading-xl": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "400" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "400" }],
        "heading": ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body": ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      boxShadow: {
        // Ultra-soft shadows
        "soft": "0 2px 10px -3px rgba(0, 0, 0, 0.04), 0 4px 20px -4px rgba(0, 0, 0, 0.03)",
        "soft-md": "0 4px 16px -4px rgba(0, 0, 0, 0.05), 0 8px 32px -8px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 8px 30px -8px rgba(0, 0, 0, 0.06), 0 16px 60px -16px rgba(0, 0, 0, 0.05)",
        "soft-xl": "0 16px 50px -12px rgba(0, 0, 0, 0.08), 0 32px 100px -24px rgba(0, 0, 0, 0.06)",
        // Glassmorphism shadows
        "glass": "0 4px 30px -4px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.05)",
        "glass-lg": "0 8px 40px -8px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.08)",
        // Calm glow
        "glow-soft": "0 0 50px -12px rgba(95, 187, 192, 0.2)",
        "inner-soft": "inset 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(100%)" },
        },
        "slide-in-bottom": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "pulse-calm": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.7s ease-out",
        "fade-in-down": "fade-in-down 0.7s ease-out",
        "fade-in-up-delay": "fade-in-up 0.7s ease-out 0.15s both",
        "fade-in-up-delay-2": "fade-in-up 0.7s ease-out 0.3s both",
        "fade-in-up-delay-3": "fade-in-up 0.7s ease-out 0.45s both",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-out-right": "slide-out-right 0.5s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "float-gentle": "float-gentle 8s ease-in-out infinite",
        "pulse-calm": "pulse-calm 4s ease-in-out infinite",
        "breathe": "breathe 6s ease-in-out infinite",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "gentle": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "calm": "cubic-bezier(0.33, 0, 0.67, 1)",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
