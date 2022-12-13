export const seviceBindings = true
declare global {
  const Address: Fetcher
  const Account: Fetcher
  const Galaxy: Fetcher
  const Access: Fetcher
  const Starbase: Fetcher

  const SECRET_SESSION_SALT: string
  const COOKIE_DOMAIN: string
  const THREEID_APP_URL: string
  const CONSOLE_APP_URL: string
  const PASSPORT_REDIRECT_URL: string
  const APIKEY_ALCHEMY_THREEID: string
  const ENS_RESOLVER_URL: string
}
