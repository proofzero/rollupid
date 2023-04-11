/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: 'cloudflare-workers',
  server: './server.ts',
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ['**/.*'],

  // Keycloak rewrites. Needed here for CSR, also done in Cloudflare for SSR.
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route('/protocol/openid-connect/auth', 'routes/authorize/index.tsx', {
        id: 'keycloakAuthIndex',
        caseSensitive: true,
        index: true
      })
      
      route('/protocol/openid-connect/token', 'routes/token.tsx', {
        id: 'keycloakToken',
        caseSensitive: true,
        index: true
      })
      
      route('/protocol/openid-connect/userinfo', 'routes/userinfo.tsx', {
        id: 'keycloakUserInfo',
        caseSensitive: true,
        index: true
      })
    })
  }
}
