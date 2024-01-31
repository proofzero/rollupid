const webpack = require('webpack')
const path = require('path')

module.exports = {
  features: {
    buildStoriesJson: true,
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    // '@storybook/preset-create-react-app',
    // '@storybook/preset-scss',
    // '@storybook/preset-typescript',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
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
      ],
      include: path.resolve(__dirname, '../'),
    })

    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.scss$/,
      sideEffects: true, //scss is considered a side effect of sass
      use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      // include: path.resolve(__dirname, '../src'), // I didn't need this path set
    })

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    )
    config.resolve.fallback = {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      vm: require.resolve('vm-browserify'),
      zlib: require.resolve('browserify-zlib'),
      assert: require.resolve('assert/'),
      _stream_transform: require.resolve("readable-stream/transform"),
      fs: false,
      net: false,
      tls: false,
      child_process: false,

    }

    // Return the altered config
    return config
  },
}
