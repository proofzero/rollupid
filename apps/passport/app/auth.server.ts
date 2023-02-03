import { createCookieSessionStorage, json } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GitHubStrategy } from 'remix-auth-github'
import { GoogleStrategy } from 'remix-auth-google'
import { MicrosoftStrategy } from 'remix-auth-microsoft'
import { TwitterStrategy } from 'remix-auth-twitter'

import { AppleStrategy } from '~/utils/applestrategy.server'

// OAuth state

export const initAuthenticator = (env: Env) => {
  if (!env.SECRET_SESSION_SALT)
    throw new Error('SECRET_SESSION_SALT is required')
  const oauthStorage = createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      httpOnly: true,
      name: 'oauth',
      path: '/',
      //Needs to be lax to allow cookie reads on callback from third-party providers
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })

  return new Authenticator(oauthStorage)
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

export const getGoogleAuthenticator = (env: Env) => {
  return new GoogleStrategy(
    {
      clientID: env.INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_GOOGLE_OAUTH_CALLBACK_URL,
      accessType: 'offline',
    },
    async (params) => params
  )
}

export const getMicrosoftStrategy = (env: Env) => {
  return new MicrosoftStrategy(
    {
      clientId: env.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID,
      tenantId: env.INTERNAL_MICROSOFT_OAUTH_TENANT_ID,
      clientSecret: env.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET,
      redirectUri: env.INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL,
      scope: 'openid profile User.Read offline_access',
      prompt: '',
    },
    async ({ ...args }) => {
      return { ...args }
    }
  )
}

export const getTwitterStrategy = (env: Env) => {
  return new TwitterStrategy(
    {
      clientID: env.INTERNAL_TWITTER_OAUTH_CLIENT_ID,
      clientSecret: env.SECRET_TWITTER_OAUTH_CLIENT_SECRET,
      callbackURL: env.INTERNAL_TWITTER_OAUTH_CALLBACK_URL,
      includeEmail: true,
    },
    async ({ ...args }) => {
      return { ...args }
    }
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
