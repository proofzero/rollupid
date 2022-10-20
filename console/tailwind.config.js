/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      // Some of this should be replaced by proper Tailwind support for dark mode
      colors: {
        "kubelt-white": "#f9fafb",
        "kubelt-light": "#f3f4f6",
        "kubelt-dark": "#1f2937",
        "kubelt-grey": "9ca3af",
        "kubelt-lightgrey": "#d1d5db",
        "kubelt-darkgrey": "#374151",
        "kubelt-header": "#192030",
        "kubelt-bar": "#4f46e5",
      },
    },
  },
  plugins: [
      require("@tailwindcss/forms"),
  ],
};
