export const seviceBindings = true

declare global {
  const NODE_ENV: string
  const COOKIE_DOMAIN: string
  const SECRET_SESSION_SALT: string
  const PASSPORT_URL: string
  const PASSPORT_AUTH_URL: string
  const PASSPORT_TOKEN_URL: string
  const CONSOLE_APP_URL: string
  const INTERNAL_GOOGLE_ANALYTICS_TAG: string

  const CLIENT_ID: string
  const CLIENT_SECRET: string
  const REDIRECT_URI: string

  const Galaxy: Fetcher
  const Address: Fetcher
  const Images: Fetcher

  type RollupAuth = {
    accessToken: string
    refreshToken: string
    extraParams: {
      scopes?: [string]
      redirect_uri?: string
    }
  }
}
