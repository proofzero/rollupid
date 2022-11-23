export const seviceBindings = true
declare global {
  const Address: Fetcher
  const Account: Fetcher
  const Galaxy: Fetcher
  const Access: Fetcher
  const Starbase: Fetcher

  const THREEID_APP_URL: string
  const PASSPORT_REDIRECT_URL: string
  const ALCHEMY_KEY: string
}
