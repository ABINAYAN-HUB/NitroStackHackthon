import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:              "var(--ink)",
        "ink-light":      "var(--ink-light)",
        paper:            "var(--paper)",
        "paper-raised":   "var(--paper-raised)",
        "paper-hover":    "var(--paper-hover)",
        surface:          "var(--surface)",
        line:             "var(--line)",
        border:           "var(--border)",
        "border-light":   "var(--border-light)",
        verified:         "var(--verified)",
        "verified-dim":   "var(--verified-dim)",
        caution:          "var(--caution)",
        "caution-dim":    "var(--caution-dim)",
        contradiction:    "var(--contradiction)",
        "contradiction-dim":"var(--contradiction-dim)",
        accent:           "var(--accent)",
        "accent-dim":     "var(--accent-dim)",
        text:             "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        body:    ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "paper-gradient": "linear-gradient(135deg, var(--paper) 0%, var(--paper-raised) 100%)",
      },
      boxShadow: {
        card:        "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--line)",
        "card-hover":"0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border-light)",
        glow:        "0 0 20px rgba(52, 211, 153, 0.15)",
        stamp:       "inset 0 0 0 3px currentColor",
      },
      animation: {
        "stamp-in":    "stampIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-up":  "fadeInUp 0.5s ease-out forwards",
        "fade-in":     "fadeIn 0.4s ease-out forwards",
        "slide-in":    "slideInRight 0.4s ease-out forwards",
        "scale-in":    "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
