module.exports = function babelConfig(api) {
  api.cache(true)
  return {
    presets: [
      '@babel/preset-typescript',
      [
        'react-app',
        {
          absoluteRuntime: false,
        },
      ],
      // [
      //   '@babel/env',
      //   {
      //     modules: false,
      //     targets: {
      //       node: '12',
      //       browsers: ['last 2 versions'],
      //     },
      //   },
      // ],
    ],
    plugins: [
      // '@babel/plugin-proposal-class-properties',
      // '@babel/plugin-syntax-dynamic-import',
      // '@babel/plugin-proposal-optional-chaining',
      // [
      //   'file-loader',
      //   {
      //     publicPath: '/dist',
      //     outputPath: '/dist',
      //     extensions: [
      //       'png',
      //       'jpg',
      //       'jpeg',
      //       'gif',
      //       'svg',
      //       'ttf',
      //       'woff',
      //       'woff2',
      //       'eot',
      //     ],
      //   },
      // ],
      // 'babel-plugin-postcss',
      // ['babel-plugin-react-css-modules', {}],
    ],
    ignore: [
      'node_modules',
      'build',
      '**/*.stories.*',
      '**/__tests__',
      '**/__mocks__',
      '**/test-utils',
    ],
  }
}
