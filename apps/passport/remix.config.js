/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  server: './server.ts',
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ['**/.*'],
  // Bundles everything _except_ `__STATIC_CONTENT_MANIFEST`. Be careful if editing.
  serverDependenciesToBundle: [/^(?!(__STATIC_CONTENT_MANIFEST)$).*$/u],
  // Optional, but highly recommended for fitting within the Worker bundle size
  serverMinify: true,
  serverModuleFormat: 'esm',
  // YMMV with setting to `node`, most likely anything but simple code won’t work with the CF node compat layer
  serverPlatform: 'neutral',
  serverMainFields: ['browser', 'module', 'main'],
  // Try the `workerd` condition first (this is new and slowly standardising), then `worker`, then `browser` (equivalent of `serverPlatform: browser` but without extra behaviour.
  serverConditions: ['workerd', 'worker', 'browser'],
  // serverNodeBuiltinsPolyfill: ['async_hooks', 'crypto'],

  // Keycloak rewrites. Needed here for CSR, also done in Cloudflare for SSR.
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route('/protocol/openid-connect/auth', 'routes/authorize.tsx', {
        id: 'keycloakAuthIndex',
        caseSensitive: true,
        index: true,
      })

      route('/protocol/openid-connect/token', 'routes/token.tsx', {
        id: 'keycloakToken',
        caseSensitive: true,
        index: true,
      })

      route('/protocol/openid-connect/userinfo', 'routes/userinfo.tsx', {
        id: 'keycloakUserInfo',
        caseSensitive: true,
        index: true,
      })
    })
  },
}
