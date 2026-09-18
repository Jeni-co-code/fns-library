/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nook: {
          950: "#181329",
          900: "#211a37",
          800: "#2d2447",
          700: "#3d3260",
        },
        paper: {
          50: "#FDFBF6",
          100: "#FAF6ED",
          200: "#F1EADA",
        },
        ink: "#241D33",
        marigold: {
          400: "#F0AF3D",
          500: "#E29A21",
          600: "#C27F17",
        },
        sage: {
          400: "#8AA98C",
          500: "#6F9271",
          600: "#587459",
        },
        berry: {
          400: "#C6597A",
          500: "#AE4166",
          600: "#8F3352",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["\"Work Sans\"", "sans-serif"],
      },
    },
  },
  plugins: [],
};
