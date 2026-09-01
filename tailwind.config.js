/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#0f172a",
        accent: {
          DEFAULT: "#b6953a",
          hover: "#9a7d2f",
          soft: "#f5eed9",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
        },
        aliceblue: "#f0f8ff",
      },
      fontFamily: {
        JakartaSans: ["Plus Jakarta Sans", "sans-serif"],
        Inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.06)",
        panel: "0 12px 32px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        content: "1400px",
      },
      screens: {
        lg: "1024px",
        max1335: { max: "1335px" },
        max1328: { max: "1328px" },
        max1190: { max: "1190px" },
        max1050: { max: "1050px" },
        max1000: { max: "1000px" },
        max980: { max: "980px" },
        max950: { max: "950px" },
        max900: { max: "900px" },
        max820: { max: "820px" },
        max800: { max: "800px" },
        max770: { max: "770px" },
        max720: { max: "720px" },
        max692: { max: "692px" },
        max670: { max: "670px" },
        max650: { max: "650px" },
        max550: { max: "550px" },
        max520: { max: "520px" },
        max450: { max: "450px" },
        max400: { max: "400px" },
        max300: { max: "300px" },
        max200: { max: "200px" },
      },
    },
  },
  plugins: [],
};
