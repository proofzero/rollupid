/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,tsx,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'font-normal',
    'font-medium',
    'font-semibold',
    'font-bold',
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
    'text-5xl',
    'text-gray-500'
  ]
}
