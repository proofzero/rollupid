import { createCookieSessionStorage, json } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GitHubStrategy } from 'remix-auth-github'
import { GoogleStrategy } from 'remix-auth-google'
import { MicrosoftStrategy } from 'remix-auth-microsoft'
import { TwitterStrategy } from 'remix-auth-twitter'

const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

// params parser

export function parseParams(request: Request, validate?: boolean) {
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')
  const redirectUri = url.searchParams.get('redirect_uri')
  const scope = url.searchParams.get('scope')

  if (validate) {
    if (!clientId) throw json({ message: 'client_id is required' }, 400)
    if (!state) throw json({ message: 'state is required' }, 400)
    if (!redirectUri) throw json({ message: 'redirect_uri is required' }, 400)
  }

  return {
    clientId,
    state,
    redirectUri,
    scope,
  }
}

// OAuth state

export const oauthStorage = createCookieSessionStorage({
  cookie: {
    domain: COOKIE_DOMAIN,
    httpOnly: true,
    name: 'oauth',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4,
    secrets: [sessionSecret],
  },
})

export const authenticator = new Authenticator(oauthStorage)

export const getGithubAuthenticator = (callbackURL?: string) => {
  return new GitHubStrategy(
    {
      clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
      clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: callbackURL || INTERNAL_GITHUB_OAUTH_CALLBACK_URL,
      allowSignup: false,
      scope: [],
    },
    async ({ ...args }) => {
      //Return all fields
      return { ...args }
    }
  )
}

export const getGoogleAuthenticator = (callbackURL?: string) => {
  return new GoogleStrategy(
    {
      clientID: INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: callbackURL || INTERNAL_GOOGLE_OAUTH_CALLBACK_URL,
    },
    async ({ ...args }) => {
      return { ...args }
    }
  )
}

export const getMicrosoftStrategy = (callbackURL?: string) => {
  return new MicrosoftStrategy(
    {
      clientId: INTERNAL_MICROSOFT_OAUTH_CLIENT_ID,
      tenantId: INTERNAL_MICROSOFT_OAUTH_TENANT_ID,
      clientSecret: SECRET_MICROSOFT_OAUTH_CLIENT_SECRET,
      redirectUri: callbackURL || INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL,
      scope: 'openid profile User.Read offline_access',
      prompt: '',
    },
    async ({ ...args }) => {
      return { ...args }
    }
  )
}

export const getTwitterStrategy = (callbackURL?: string) => {
  return new TwitterStrategy(
    {
      clientID: INTERNAL_TWITTER_OAUTH_CLIENT_ID,
      clientSecret: SECRET_TWITTER_OAUTH_CLIENT_SECRET,
      callbackURL: callbackURL || INTERNAL_TWITTER_OAUTH_CALLBACK_URL,
      includeEmail: true,
    },
    async ({ ...args }) => {
      return { ...args }
    }
  )
}
