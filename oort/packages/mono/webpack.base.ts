import CopyPlugin from 'copy-webpack-plugin'
import DotenvPlugin from 'dotenv-webpack'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

import webpack from 'webpack'

export default {
  entry: './src/index.ts',
  target: 'webworker',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/shim.mjs', to: 'shim.mjs' }],
    }),
    new DotenvPlugin({
      safe: true,
      defaults: true,
      systemvars: true,
      allowEmptyValues: true,
      silent: true,
    }),
    new NodePolyfillPlugin(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      async_hooks: false,
      bufferutil: false,
      child_process: false,
      dgram: false,
      fs: false,
      http2: false,
      net: false,
      tls: false,
      'utf-8-validate': false,
    },
  },
} as webpack.Configuration
