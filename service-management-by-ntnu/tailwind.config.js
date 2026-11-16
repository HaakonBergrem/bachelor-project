/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        "brand-base": {
          50: "#C1DAE3",
          100: "#A7CAD7",
          200: "#7EB2C4",
          300: "#5E9FB5",
          400: "#3C8AA6",
          500: "#147193", // Button
          600: "#1B6785",
          700: "#225D76",
          800: "#2F4858",
          900: "#273B49",
          950: "#1D2D37",
          DEFAULT: "#147193",
        },
        "brand-accent": {
          DEFAULT: "#d96c00",
        },

      },
      fontFamily:{
          sans: ['Rubik Variable', 'Tahoma', 'Arial', 'sans-serif'],
      },
      fontSize:{
        'base': '20px'
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
