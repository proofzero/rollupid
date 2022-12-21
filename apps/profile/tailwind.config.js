const path = require('path')

const getRelativeModulePath = (moduleName) => {
  const absolutePath = require.resolve(moduleName)
  const splitPath = absolutePath.split(path.sep)

  let basePath = splitPath[0]
  for (let i = 1; i < splitPath.length; i++) {
    basePath = path.join(basePath, splitPath[i])
    if (splitPath[i] === moduleName) {
      break
    }
  }

  return path.relative(__dirname, basePath)
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,jsx,js}',
    '../../packages/design-system/src/**/*.{ts,tsx,jsx,js}',
    path.join(
      getRelativeModulePath('flowbite-react'),
      '**',
      '*.{js,jsx,ts,tsx}'
    ),
    path.join(getRelativeModulePath('tw-elements'), 'dist', 'js', '**', '*.js'),
  ],
  theme: {
    extend: {
      colors: {
        'dull-white': '#f9fafb',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('tw-elements/dist/plugin'),
    require('@tailwindcss/forms'),
  ],
}
