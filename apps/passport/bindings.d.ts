export const seviceBindings = true

declare global {
  interface Env {
    Address: Fetcher
    Account: Fetcher
    Galaxy: Fetcher
    Access: Fetcher
    Starbase: Fetcher
    Images: Fetcher

    SECRET_SESSION_SALT: string
    COOKIE_DOMAIN: string
    PROFILE_APP_URL: string
    CONSOLE_APP_URL: string
    PASSPORT_REDIRECT_URL: string
    APIKEY_ALCHEMY_PUBLIC: string

    INTERNAL_GOOGLE_ANALYTICS_TAG: string

    INTERNAL_GOOGLE_OAUTH_CLIENT_ID: string
    SECRET_GOOGLE_OAUTH_CLIENT_SECRET: string
    INTERNAL_GOOGLE_OAUTH_CALLBACK_URL: string

    INTERNAL_GITHUB_OAUTH_CLIENT_ID: string
    SECRET_GITHUB_OAUTH_CLIENT_SECRET: string
    INTERNAL_GITHUB_OAUTH_CALLBACK_URL: string

    INTERNAL_TWITTER_OAUTH_CLIENT_ID: string
    SECRET_TWITTER_OAUTH_CLIENT_SECRET: string
    INTERNAL_TWITTER_OAUTH_CALLBACK_URL: string
    INTERNAL_MICROSOFT_OAUTH_CLIENT_ID: string
    INTERNAL_MICROSOFT_OAUTH_TENANT_ID: string
    SECRET_MICROSOFT_OAUTH_CLIENT_SECRET: string
    INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL: string

    INTERNAL_APPLE_OAUTH_CLIENT_ID: string
    SECRET_APPLE_OAUTH_CLIENT_SECRET: string
    INTERNAL_APPLE_OAUTH_CALLBACK_URL: string
  }

  interface ConsoleParams {
    clientId: string
    redirectUri: string
    scope: string
    state: string
    prompt: string | undefined
  }
}
declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    env: Env
    consoleParams: ConsoleParams
  }
}
