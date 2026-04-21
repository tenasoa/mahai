/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px" /* Mobile large */,
      md: "768px" /* Tablettes portrait */,
      lg: "1024px" /* Tablettes paysage / Desktop */,
      xl: "1280px" /* Grand desktop */,
      "2xl": "1536px" /* Écrans larges */,
    },
    extend: {
      colors: {
        // Backgrounds
        void: "var(--void)",
        depth: "var(--depth)",
        surface: "var(--surface)",
        card: {
          DEFAULT: "var(--card)",
          hover: "var(--card-hover)",
        },
        lift: "var(--lift)",

        // Gold palette
        gold: {
          DEFAULT: "var(--gold)",
          hi: "var(--gold-hi)",
          lo: "var(--gold-lo)",
          dim: "var(--gold-dim)",
          glow: "var(--gold-glow)",
          line: "var(--gold-line)",
        },

        // Text
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          4: "var(--text-4)",
        },

        // Accents
        ruby: "var(--ruby)",
        sage: "var(--sage)",
        ivory: "var(--ivory)",

        // Borders
        border: {
          1: "var(--b1)",
          2: "var(--b2)",
          3: "var(--b3)",
        },
      },
      fontFamily: {
        display: ["var(--display)", "serif"],
        body: ["var(--body)", "sans-serif"],
        mono: ["var(--mono)", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(201,168,76,0.08)",
        "glow-md": "0 0 40px rgba(201,168,76,0.12)",
        "glow-lg": "0 0 80px rgba(201,168,76,0.1)",
      },
      fontSize: {
        hero: ["64px", { lineHeight: "1.1" }],
        h1: ["32px", { lineHeight: "1.2" }],
        h2: ["24px", { lineHeight: "1.3" }],
        h3: ["18px", { lineHeight: "1.4" }],
        body: ["15px", { lineHeight: "1.6" }],
      },
      maxWidth: {
        content: "1300px",
      },
      spacing: {
        sidebar: "224px",
        topbar: "54px",
        content: "26px",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
