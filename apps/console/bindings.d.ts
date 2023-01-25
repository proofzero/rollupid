export const seviceBindings = true
declare global {
  const Starbase: Fetcher
  const Images: Fetcher
  const Galaxy: Fetcher

  const SECRET_SESSION_SALT: string
  const COOKIE_DOMAIN: string
  const PASSPORT_URL: string
  const STORAGE_NAMESPACE: string
  const INTERNAL_GOOGLE_ANALYTICS_TAG: string
  const THREEID_APP_URL: string

  enum RollType {
    RollAPIKey = 'roll_api_key',
    RollClientSecret = 'roll_app_secret',
  }

  type RotatedSecrets = {
    rotatedApiKey: string
    rotatedClientSecret: string
  }}
}
