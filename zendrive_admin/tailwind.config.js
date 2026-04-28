/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: { 900: "#0F172A", 800: "#1E293B", 700: "#334155", 500: "#64748B", 300: "#CBD5E1" },
        accent: { DEFAULT: "#DC2626", dark: "#991B1B" },
        zen: { bg: "#F8FAFC", card: "#FFFFFF", line: "#E2E8F0" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
