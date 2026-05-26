/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#121416",
          800: "#20242A",
          700: "#3A414B",
          500: "#6D737D",
          300: "#C9C2B8",
        },
        accent: {
          DEFAULT: "#CF1F2B",
          dark: "#9F1520",
          darker: "#7F1119",
        },
        zen: {
          bg: "#F5F3EF",
          card: "#FFFFFF",
          line: "#DED8CE",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Cormorant", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15,23,42,0.18)",
        glow: "0 0 0 1px rgba(220,38,38,0.25), 0 12px 40px -10px rgba(220,38,38,0.45)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.65)), url('./assets/banner.png')",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 18px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -8px, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
        drift: "drift 10s ease-in-out infinite",
        shimmer: "shimmer 1.45s linear infinite",
      },
    },
  },
  plugins: [],
};
