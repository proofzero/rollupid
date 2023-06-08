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
    './app/**/*.{ts,tsx,jsx,js,mdx}',
    './node_modules/flowbite/**/*.js',
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
          text: withOpacity('--color-primary-contrast-text'),
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
      boxShadowColor: {
        skin: {
          primary: withOpacity('--color-primary'),
        },
      },
    },
  },
  safelist: ['lg:rounded-sm', 'lg:rounded-md', 'lg:rounded-lg'],
  plugins: [require('flowbite/plugin')],
}
