/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,jsx,js}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        "dull-white": "#f9fafb",
      },
    },
  },
  plugins: [require("flowbite/plugin"), require("tw-elements/dist/plugin")],
};
