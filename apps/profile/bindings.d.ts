interface Env {
  NODE_ENV: string
  COOKIE_DOMAIN: string
  SECRET_SESSION_KEY: string
  SECRET_SESSION_SALT: string
  PASSPORT_URL: string
  IMAGES_URL: string
  PASSPORT_AUTH_URL: string
  PASSPORT_TOKEN_URL: string
  INTERNAL_GOOGLE_ANALYTICS_TAG: string

  PROFILE_CLIENT_ID: string
  PROFILE_CLIENT_SECRET: string
  REDIRECT_URI: string

  Galaxy: Fetcher
  Address: Fetcher
  Images: Fetcher

  ProfileKV: KVNamespace
  PROFILE_VERSION: number
  ALCHEMY_ETH_NETWORK: 'mainnet' | 'goerli'
  APIKEY_ALCHEMY_ETH: string
  ALCHEMY_POLYGON_NETWORK: 'mainnet' | 'mumbai'
  APIKEY_ALCHEMY_POLYGON: string
  //Needed to make Remix work with Cloudflare module workers
  __STATIC_CONTENT: string
}
