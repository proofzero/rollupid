/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./app/**/*.{ts,tsx,jsx,js}",
      './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "dull-white": "#f9fafb",
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
