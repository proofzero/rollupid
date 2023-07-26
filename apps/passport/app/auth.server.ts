import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { DiscordStrategy, DiscordStrategyOptions } from 'remix-auth-discord'
import { GitHubStrategy } from 'remix-auth-github'
import { GoogleStrategy, GoogleStrategyOptions } from 'remix-auth-google'
import {
  MicrosoftStrategy,
  MicrosoftStrategyOptions,
} from 'remix-auth-microsoft'
import { Twitter2Strategy } from 'remix-auth-twitter'

import { AppleStrategy } from '~/utils/applestrategy.server'
import { getCookieDomain } from './utils/cookie'

// OAuth state

export const createAuthenticatorSessionStorage = (
  request: Request,
  env: Env
) => {
  return createCookieSessionStorage({
    cookie: {
      domain: getCookieDomain(request, env),
      httpOnly: true,
      name: 'external_oauth_login',
      path: '/',
      //Needs to be lax to allow cookie reads on callback from third-party providers
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })
}

export const AUTHN_PARAMS_SESSION_KEY = 'authnParams'

export const getAuthnParams = async (
  request: Request,
  env: Env
): Promise<URLSearchParams> => {
  const authenticatorStorage = createAuthenticatorSessionStorage(request, env)
  const session = await authenticatorStorage.getSession(
    request.headers.get('Cookie')
  )
  return new URLSearchParams(session.get(AUTHN_PARAMS_SESSION_KEY))
}

/**
 * Returns a custom Request and authenticator SessionStorage. Needed to hook into response
 * lifecycle that authenticator fully controls, to set custom data needed after external
 * OAuth authentication returns.
 */
export const injectAuthnParamsIntoSession = async (
  authnParams: string,
  request: Request,
  env: Env
) => {
  const authenticatorStorage = createAuthenticatorSessionStorage(request, env)
  const session = await authenticatorStorage.getSession(
    request.headers.get('Cookie')
  )
  session.set(AUTHN_PARAMS_SESSION_KEY, authnParams)

  const clonedReq = new Request(request.url, {
    headers: {
      ...request.headers,
      cookie: await authenticatorStorage.commitSession(session),
    },
  })
  return {
    sessionStorage: authenticatorStorage,
    newRequest: clonedReq,
  }
}

export const getGithubAuthenticator = (env: Env) => {
  return new GitHubStrategy(
    {
      clientID: env.INTERNAL_GITHUB_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_GITHUB_OAUTH_CALLBACK_URL,
      allowSignup: false,
      scope: [],
    },
    async ({ ...args }) => {
      //Return all fields
      return { ...args }
    }
  )
}

export const getGoogleAuthenticator = (
  env: Env,
  prompt?: GoogleStrategyOptions['prompt']
) => {
  return new GoogleStrategy(
    {
      clientID: env.INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_GOOGLE_OAUTH_CALLBACK_URL,
      accessType: 'offline',
      prompt,
    },
    async (params) => params
  )
}

export const getMicrosoftStrategy = (
  env: Env,
  prompt?: MicrosoftStrategyOptions['prompt']
) => {
  return new MicrosoftStrategy(
    {
      clientId: env.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID,
      tenantId: 'common',
      clientSecret: env.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET,
      redirectUri: env.INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL,
      scope: 'openid profile email User.Read offline_access',
      prompt,
    },
    async ({ ...args }) => {
      return { ...args }
    }
  )
}

export const getTwitterStrategy = (env: Env) => {
  return new Twitter2Strategy(
    {
      clientID: env.INTERNAL_TWITTER_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_TWITTER_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_TWITTER_OAUTH_CALLBACK_URL,
      scopes: ['users.read', 'tweet.read'],
    },
    async (params) => params
  )
}

export const getAppleStrategy = (env: Env) => {
  return new AppleStrategy(
    {
      clientID: env.INTERNAL_APPLE_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_APPLE_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_APPLE_OAUTH_CALLBACK_URL,
      scope: 'name email',
    },
    async (params) => params
  )
}

export const getDiscordStrategy = (
  env: Env,
  prompt?: DiscordStrategyOptions['prompt']
) => {
  return new DiscordStrategy(
    {
      clientID: env.INTERNAL_DISCORD_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_DISCORD_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_DISCORD_OAUTH_CALLBACK_URL,
      prompt,
      scope: ['email', 'identify'],
    },
    async (params) => params
  )
}
