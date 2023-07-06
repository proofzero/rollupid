import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'

export const seviceBindings = true

declare global {
  interface Env {
    Address: Fetcher
    Account: Fetcher
    Galaxy: Fetcher
    Access: Fetcher
    Starbase: Fetcher
    Images: Fetcher

    DEFAULT_HOSTS: string[]
    COOKIE_DOMAIN: string
    SECRET_SESSION_KEY: string
    SECRET_SESSION_SALT: string
    PROFILE_APP_URL: string
    CONSOLE_APP_URL: string
    PASSPORT_REDIRECT_URL: string
    APIKEY_ALCHEMY_PUBLIC: string
    WALLET_CONNECT_PROJECT_ID: string
    REMIX_DEV_SERVER_WS_PORT: number

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

    INTERNAL_DISCORD_OAUTH_CLIENT_ID: string
    SECRET_DISCORD_OAUTH_CLIENT_SECRET: string
    INTERNAL_DISCORD_OAUTH_CALLBACK_URL: string

    POSTHOG_API_KEY: string
  }

  interface AuthzParams {
    clientId: string
    redirectUri: string
    scope: string[]
    state: string
    prompt?: string
    login_hint?: string
    rollup_action?: string
    rollup_result?: string
  }

  //Same-ish structure, different type name for easier identification
  type AuthzCookieParams = AuthzParams & { source: 'cookie' }
}
declare module '@remix-run/cloudflare' {
  export interface AppLoadContext {
    authzQueryParams: AuthzParams
    env: Env
    traceSpan: TraceSpan
  }
}
