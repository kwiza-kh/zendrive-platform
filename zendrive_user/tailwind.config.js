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
          500: "#64748B",
          300: "#CBD5E1",
        },
        accent: {
          DEFAULT: "#DC2626",
          dark: "#991B1B",
          darker: "#7F1D1D",
        },
        zen: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          line: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15,23,42,0.18)",
        glow: "0 0 0 1px rgba(220,38,38,0.25), 0 12px 40px -10px rgba(220,38,38,0.45)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.65)), url('./assets/banner.png')",
      },
    },
  },
  plugins: [],
};
