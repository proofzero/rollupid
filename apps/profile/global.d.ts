export const seviceBindings = true

declare global {
  const NODE_ENV: string
  const COOKIE_DOMAIN: string
  const SESSON_SECRET: string
  const PASSPORT_URL: String
  const INTERNAL_GOOGLE_ANALYTICS_TAG: String

  const Galaxy: Fetcher
  const Address: Fetcher
  const Images: Fetcher
  const Indexer: Fetcher
}
