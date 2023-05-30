export const seviceBindings = true

declare global {
  const NODE_ENV: string
  const COOKIE_DOMAIN: string
  const SECRET_SESSION_KEY: string
  const SECRET_SESSION_SALT: string
  const PASSPORT_URL: string
  const IMAGES_URL: string
  const PASSPORT_AUTH_URL: string
  const PASSPORT_TOKEN_URL: string
  const INTERNAL_GOOGLE_ANALYTICS_TAG: string
  const JWKS_INTERNAL_URL_BASE: string

  const PROFILE_CLIENT_ID: string
  const PROFILE_CLIENT_SECRET: string
  const REDIRECT_URI: string

  const Galaxy: Fetcher
  const Address: Fetcher
  const Images: Fetcher

  const ProfileKV: KVNamespace
  const PROFILE_VERSION: number
  const ALCHEMY_ETH_NETWORK: 'mainnet' | 'goerli'
  const APIKEY_ALCHEMY_ETH: string
  const ALCHEMY_POLYGON_NETWORK: 'mainnet' | 'mumbai'
  const APIKEY_ALCHEMY_POLYGON: string
}
