/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        accent: { DEFAULT: "#DC2626", dark: "#B91C1C" },
        zen: { bg: "#F8FAFC", card: "#FFFFFF", line: "#E2E8F0" },
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.06)",
        lift: "0 4px 20px rgba(15,23,42,0.12)",
        glow: "0 0 0 3px rgba(220,38,38,0.12)",
      },
    },
  },
  plugins: [],
};
