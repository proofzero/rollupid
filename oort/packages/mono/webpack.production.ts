import { merge } from 'webpack-merge'
import base from './webpack.base'

export default merge(base, {
  mode: 'production',
  optimization: {
    minimize: true,
  },
})
