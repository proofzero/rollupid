export const seviceBindings = true
declare global {
  const Address: Fetcher
  const Account: Fetcher
  const Galaxy: Fetcher
  const Access: Fetcher
  const Starbase: Fetcher

  const SESSION_SECRET: string
  const COOKIE_DOMAIN: string
  const THREEID_APP_URL: string
  const PASSPORT_REDIRECT_URL: string
  const ALCHEMY_KEY: string
}
