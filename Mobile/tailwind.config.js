/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          secondary: "#3B82F6",
          dark: "#1D4ED8",
          light: "#60A5FA",
          subtle: "#EFF6FF",
        },
        navy: {
          DEFAULT: "#0F172A",
          dark: "#080F2D",
          light: "#1E293B",
          card: "#F8FAFC",
        },
        accent: {
          cyan: "#06B6D4",
          purple: "#7C3AED",
        },
        background: "#F8FAFC",
        card: "#FFFFFF",
        muted: "#64748B",
        secondary: "#475569",
        border: "#E2E8F0",
        success: "#16A34A",
        cyan: "#06B6D4",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
    },
  },
  plugins: [],
};
