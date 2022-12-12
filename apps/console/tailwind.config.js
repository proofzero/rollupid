/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,jsx,js}',
    '../../packages/design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    extend: {
      colors: {
        'dull-white': '#f9fafb',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
