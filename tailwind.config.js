/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Cyberpunk Color Palette ──────────────────────────────────────────
      colors: {
        neon: {
          green:  "#00ff41",
          cyan:   "#00d4ff",
          red:    "#ff0040",
          yellow: "#ffee00",
          purple: "#bf00ff",
          orange: "#ff6600",
        },
        ares: {
          dark:   "#020408",
          panel:  "#020d06",
          card:   "#040f07",
          border: "#0d2e14",
        },
      },

      // ── Fonts ────────────────────────────────────────────────────────────
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        mono:     ["Share Tech Mono", "monospace"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },

      // ── Custom Animations ────────────────────────────────────────────────
      keyframes: {
        glitch: {
          "0%, 100%": {
            textShadow: "2px 0 #00d4ff, -2px 0 #ff0040",
            transform: "skewX(0deg)",
          },
          "20%": {
            textShadow: "-2px 0 #00d4ff, 2px 0 #ff0040",
            transform: "skewX(-2deg)",
          },
          "40%": {
            textShadow: "4px 0 #00d4ff, -4px 0 #ff0040",
            transform: "skewX(1deg)",
          },
          "60%": { textShadow: "none", transform: "skewX(0deg)" },
          "80%": {
            textShadow: "-3px 0 #00d4ff, 3px 0 #ff0040",
            transform: "skewX(-1deg)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px #00ff41, 0 0 10px rgba(0,255,65,0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 15px #00ff41, 0 0 30px rgba(0,255,65,0.5), 0 0 50px rgba(0,255,65,0.2)",
          },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%":   { left: "-100%" },
          "100%": { left: "200%" },
        },
        appear: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "power-on": {
          "0%":   { opacity: "0", filter: "brightness(0)", transform: "scaleY(0.02)" },
          "30%":  { opacity: "0.8", filter: "brightness(2)", transform: "scaleY(0.1)" },
          "60%":  { opacity: "1", filter: "brightness(1.5)", transform: "scaleY(0.98)" },
          "100%": { opacity: "1", filter: "brightness(1)", transform: "scaleY(1)" },
        },
        "matrix-rain": {
          "0%":   { opacity: "1", top: "-10%" },
          "100%": { opacity: "0", top: "110%" },
        },
        "data-stream": {
          "0%":   { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-20px)", opacity: "0" },
        },
        radar: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },

      animation: {
        glitch:       "glitch 3s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line":  "scan-line 4s linear infinite",
        blink:        "blink 1s step-end infinite",
        float:        "float 3s ease-in-out infinite",
        "spin-slow":  "spin-slow 8s linear infinite",
        shimmer:      "shimmer 3s infinite",
        appear:       "appear 0.4s ease forwards",
        "power-on":   "power-on 0.8s ease forwards",
        radar:        "radar 3s linear infinite",
      },

      // ── Box Shadows ──────────────────────────────────────────────────────
      boxShadow: {
        "neon-green":  "0 0 10px #00ff41, 0 0 20px rgba(0,255,65,0.4)",
        "neon-cyan":   "0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,0.4)",
        "neon-red":    "0 0 10px #ff0040, 0 0 20px rgba(255,0,64,0.4)",
        "neon-yellow": "0 0 10px #ffee00, 0 0 20px rgba(255,238,0,0.4)",
        "neon-purple": "0 0 10px #bf00ff, 0 0 20px rgba(191,0,255,0.4)",
        "card-hover":  "0 8px 30px rgba(0,255,65,0.15)",
      },

      // ── Backgrounds ──────────────────────────────────────────────────────
      backgroundImage: {
        "grid-neon": `
          linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)
        `,
        "gradient-cyber": "linear-gradient(135deg, #020408 0%, #020d06 50%, #020408 100%)",
        "gradient-card":  "linear-gradient(180deg, rgba(0,255,65,0.05) 0%, transparent 100%)",
      },
      backgroundSize: {
        grid: "50px 50px",
      },

      // ── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        cyber: "4px",
      },

      // ── Backdrop Blur ────────────────────────────────────────────────────
      backdropBlur: {
        cyber: "12px",
      },
    },
  },

  plugins: [],
};
