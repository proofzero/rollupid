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
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [require('tailwindcss'), require('autoprefixer')],
            },
          },
        },
        // 'css-loader',
      ],
      include: [
        path.resolve(__dirname, '../app'),
        path.resolve(__dirname, '../app/routes'),
      ],
    })

    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true, //scss is considered a side effect of sass
      use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../app'), // I didn't need this path set
    })

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    )

    return config
  },
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
