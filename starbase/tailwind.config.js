module.exports = {
  content: [
    "./src/**/**/*.cljs",
    "./starbase/src/**/**/*.cljs",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
