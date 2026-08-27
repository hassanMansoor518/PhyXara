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
          DEFAULT: "#6C4DFF",
          dark: "#4B35C8",
          light: "#8F78FF",
          subtle: "#EEE9FF",
        },
        navy: {
          DEFAULT: "#101A43",
          dark: "#080F2D",
          light: "#212E64",
          card: "#121C42",
        },
        background: "#F5F6FF",
        muted: "#737A96",
        border: "#E8EAF4",
        success: "#32C978",
        cyan: "#42D9FF",
        warning: "#FFB020",
        danger: "#FF4D4F",
      },
    },
  },
  plugins: [],
};
