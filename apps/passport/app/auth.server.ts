import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { GitHubStrategy } from 'remix-auth-github'
import { TwitterStrategy } from 'remix-auth-twitter'
import { MicrosoftStrategy } from 'remix-auth-microsoft'

const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

export const sessionStorage = createCookieSessionStorage({
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

export const authenticator = new Authenticator(sessionStorage)

// authenticator.use(
//   new GoogleStrategy(
//     {
//       clientID: INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
//       clientSecret: SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
//       callbackURL: INTERNAL_GOOGLE_OAUTH_CALLBACK_URL,
//     },
//     async ({ accessToken, refreshToken, extraParams, profile }) => {
//       return {
//         accessToken,
//         refreshToken,
//         extraParams,
//         profile,
//       }
//     }
//   )
// )

// authenticator.use(
//   new GitHubStrategy(
//     {
//       clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
//       clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
//       callbackURL: INTERNAL_GITHUB_OAUTH_CALLBACK_URL,
//       allowSignup: false,
//       scope: [],
//     },
//     async ({ ...args }) => {
//       //Return all fields
//       return { ...args }
//     }
//   )
// )

// authenticator.use(
//   new TwitterStrategy(
//     {
//       clientID: INTERNAL_TWITTER_OAUTH_CLIENT_ID,
//       clientSecret: SECRET_TWITTER_OAUTH_CLIENT_SECRET,
//       callbackURL: INTERNAL_TWITTER_OAUTH_CALLBACK_URL,
//       includeEmail: true,
//     },
//     async ({ accessToken, accessTokenSecret, profile }) => {
//       return {
//         accessToken,
//         accessTokenSecret,
//         profile,
//       }
//     }
//   )
// )

// authenticator.use(
//   new MicrosoftStrategy(
//     {
//       clientId: INTERNAL_MICROSOFT_OAUTH_CLIENT_ID,
//       tenantId: INTERNAL_MICROSOFT_OAUTH_TENANT_ID,
//       clientSecret: SECRET_MICROSOFT_OAUTH_CLIENT_SECRET,
//       redirectUri: INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL,
//       scope: 'openid profile User.Read offline_access',
//       prompt: '',
//     },
//     async ({ ...args }) => {
//       return { ...args }
//     }
//   )
// )
