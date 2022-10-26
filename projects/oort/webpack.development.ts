import { merge } from 'webpack-merge'
import base from './webpack.base'

export default merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    // filename: 'index.js',
    // libraryTarget: 'commonjs',
    sourceMapFilename: 'index.js.map',
  },
  optimization: {
    minimize: false,
  },
})
