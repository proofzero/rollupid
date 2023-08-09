import * as esbuild from 'esbuild'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

/**
 * An esbuild plugin that will mark any `node:...` imports as external.
 */
export const nodejsCompatPlugin = {
  name: 'nodejs_compat imports plugin',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /node:.*/ }, () => {
      return { external: true }
    })
  },
}

console.log('Running custom build')
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'neutral',
  format: 'esm',
  mainFields: ['browser', 'main'],
  conditions: ['workerd', 'worker', 'browser'],
  outfile: 'dist/index.js',
  define: { global: 'globalThis' },
  target: 'es2022',
  loader: { '.js': 'jsx', '.mjs': 'jsx', '.cjs': 'jsx' },
  plugins: [
    nodejsCompatPlugin,
    polyfillNode({
      polyfills: { http: true, https: true, zlib: true },
    }),
  ],
})
console.log('Done custom build')
