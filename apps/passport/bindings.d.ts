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
  const APIKEY_ALCHEMY_PUBLIC: string

  const INTERNAL_GOOGLE_OAUTH_CLIENT_ID: string
  const SECRET_GOOGLE_OAUTH_CLIENT_SECRET: string
  const INTERNAL_GOOGLE_OAUTH_CALLBACK_URL: string

  const INTERNAL_GITHUB_OAUTH_CLIENT_ID: string
  const SECRET_GITHUB_OAUTH_CLIENT_SECRET: string
  const INTERNAL_GITHUB_OAUTH_CALLBACK_URL: string 
}
