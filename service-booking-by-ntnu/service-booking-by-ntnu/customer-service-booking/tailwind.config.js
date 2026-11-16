/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-base": {
          50: "#C1DAE3",
          100: "#A7CAD7",
          200: "#7EB2C4",
          300: "#5E9EB5",
          400: "#3C8AA6",
          500: "#147193",
          600: "#1B6785",
          700: "#225D76",
          800: "#2E4858",
          900: "#273B49",
          950: "#1D2D37",
          DEFAULT: "#147193"

        },
        "brand-accent": {
          DEFAULT: "#d96c00"
        },

      }

    },
  },
  plugins: [],
};