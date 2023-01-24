export const seviceBindings = true

declare global {
  const NODE_ENV: string
  const COOKIE_DOMAIN: string
  const SESSON_SECRET: string
  const PASSPORT_URL: string
  const CONSOLE_APP_URL: string
  const INTERNAL_GOOGLE_ANALYTICS_TAG: string

  const CLIENT_ID: string
  const CLIENT_SECRET: string
  const REDIRECT_URI: string

  const Galaxy: Fetcher
  const Address: Fetcher
  const Images: Fetcher
  const Indexer: Fetcher
}
