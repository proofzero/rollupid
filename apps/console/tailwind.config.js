/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,jsx,js}',
    '../../packages/design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    extend: {
      colors: {
        'dull-white': '#f9fafb',
      },
      textColor: {
        skin: {
          primary: withOpacity('--color-primary'),
        },
      },
      backgroundColor: {
        skin: {
          primary: withOpacity('--color-primary'),
        },
      },
      ringColor: {
        skin: {
          primary: withOpacity('--color-primary'),
        },
      },
      borderColor: {
        skin: {
          primary: withOpacity('--color-primary'),
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
  safelist: ['lg:rounded-sm', 'lg:rounded-md', 'lg:rounded-lg'],
}
