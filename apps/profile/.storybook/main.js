const webpack = require('webpack')
const path = require('path')

module.exports = {
  stories: [
    '../app/components/**/*.stories.mdx',
    '../app/components/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  staticDirs: [{ from: '../app/assets', to: 'static/media/app/assets' }],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  refs: () => {
    return {
      design: {
        title: 'Design System Storybook',
        url: 'http://localhost:6006',
      },
    }
  },
}
