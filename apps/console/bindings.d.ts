export const seviceBindings = true

interface Env {
  Core: Fetcher
  Images: Fetcher

  SECRET_SESSION_KEY: string
  SECRET_SESSION_SALT: string
  COOKIE_DOMAIN: string
  PASSPORT_URL: string
  STORAGE_NAMESPACE: string
  INTERNAL_GOOGLE_ANALYTICS_TAG: string
  PROFILE_APP_URL: string

  INTERNAL_PASSPORT_SERVICE_NAME: string

  INTERNAL_CLOUDFLARE_ZONE_ID: string
  TOKEN_CLOUDFLARE_API: string
  WALLET_CONNECT_PROJECT_ID: string

  SECRET_STRIPE_API_KEY: string
  SECRET_STRIPE_WEBHOOK_SECRET: string
  SECRET_STRIPE_PRO_PLAN_ID: string
  SECRET_STRIPE_GROUP_SEAT_PLAN_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_PRICE_IDS: string
  STRIPE_PUBLISHABLE_KEY: string

  POSTHOG_API_KEY: string
  POSTHOG_PROXY_HOST: string

  CONSOLE_URL: string
  //Needed to make Remix work with Cloudflare module workers
  __STATIC_CONTENT: string
}
