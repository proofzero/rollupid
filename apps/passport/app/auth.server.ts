import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { GitHubStrategy } from 'remix-auth-github'

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
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 4,
    secrets: [sessionSecret],
  },
});

export const authenticator = new Authenticator(sessionStorage)

authenticator.use(new GoogleStrategy({
  clientID: INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
  callbackURL: INTERNAL_GOOGLE_OAUTH_CALLBACK_URL,
},
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    return {
      accessToken,
      refreshToken,
      extraParams,
      profile,
    }
  }
))


authenticator.use(new GitHubStrategy(
  {
    clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID, 
    clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET, 
    callbackURL: INTERNAL_GITHUB_OAUTH_CLIENT_ID, 
    allowSignup: false,
    scope: []
  }, async({...args}) => { 
    //Return all fields
    return { ...args }
  })
)