module.exports = {
  content: [
    "./src/**/**/*.cljs",
    "./dapp/src/**/**/*.cljs",
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
