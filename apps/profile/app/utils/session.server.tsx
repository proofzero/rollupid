import {
  createCookieSessionStorage,
  redirect,
  Session,
} from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import type { OAuth2Profile } from 'remix-auth-oauth2'
import { OAuth2Strategy } from 'remix-auth-oauth2'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'
import type { RollupAuth } from '~/types'

// @ts-ignore
const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

const getProfileSessionStorage = () =>
  createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      httpOnly: true,
      name: '_rollup_profile_oauth',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7776000 /*60 * 60 * 24 * 90*/,
      secrets: [sessionSecret],
    },
  })

export const initAuthenticator = () => {
  const oauthStorage = getProfileSessionStorage()
  return new Authenticator<RollupAuth>(oauthStorage)
}
export const getRollupAuthenticator = () => {
  const authenticator = initAuthenticator()
  const rollupStrategy = new OAuth2Strategy<RollupAuth, OAuth2Profile>(
    {
      authorizationURL: PASSPORT_AUTH_URL,
      tokenURL: PASSPORT_TOKEN_URL,
      clientID: PROFILE_CLIENT_ID,
      clientSecret: PROFILE_CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
    },
    async ({ accessToken, refreshToken, extraParams }) => {
      return { accessToken, refreshToken, extraParams }
    }
  )
  authenticator.use(rollupStrategy, 'rollup')
  return authenticator
}

// our authenticate function receives the Request, the Session and a Headers
// we make the headers optional so loaders don't need to pass one
// https://sergiodxa.com/articles/working-with-refresh-tokens-in-remix
export async function requireJWT(request: Request, headers = new Headers()) {
  const AuthorizationError = class extends Error {}

  const session = await getProfileSession(request)

  try {
    const {
      user: { accessToken },
    } = session.data

    // if not found, redirect to login, this means the user is not even logged-in
    if (!accessToken) throw redirect('/auth')

    const parsedToken = parseJwt(accessToken)

    // if expired throw an error (we can extends Error to create this)
    if (!parsedToken.exp || parsedToken.exp * 1000 <= Date.now()) {
      throw new AuthorizationError('Expired')
    }

    // if not expired, return the access token
    return accessToken
  } catch (error) {
    // here, check if the error is an AuthorizationError (the one we throw above)
    if (error instanceof AuthorizationError) {
      const {
        user: { refreshToken },
      } = session.data

      if (!refreshToken) {
        throw redirect('/signout')
      }

      // refresh the access token
      const form = new FormData()
      form.append('grant_type', 'refresh_token')
      form.append('refresh_token', refreshToken.toString())
      form.append('client_id', PROFILE_CLIENT_ID)
      form.append('client_secret', PROFILE_CLIENT_SECRET)
      const token = await fetch(PASSPORT_TOKEN_URL, {
        method: 'post',
        body: form,
      }).catch((err) => {
        console.error('failed to refresh token', err)
        throw redirect('/signout')
      })

      if (!token.ok) {
        const error = await token.text()
        console.error('failed to refresh token', error)
        throw redirect('/signout')
      }

      const { access_token } = await token.json<{
        access_token: string
      }>()

      const { user } = session.data
      user.accessToken = access_token

      // update the session with the new values
      session.set('user', user)

      // commit the session and append the Set-Cookie header
      headers.append(
        'Set-Cookie',
        await getProfileSessionStorage().commitSession(session)
      )

      // redirect to the same URL if the request was a GET (loader)
      if (request.method === 'GET') throw redirect(request.url, { headers })

      // return the access token so you can use it in your action
      return access_token
    }

    // force a signout and redirect to profile /signout
    const authenticator = initAuthenticator()
    return authenticator.logout(request, {
      redirectTo: '/signout',
    })
  }
}

export async function isValidJWT(request: Request): Promise<boolean> {
  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken

  if (!jwt || typeof jwt !== 'string') {
    return false
  }

  const parsedJWT = parseJwt(jwt)
  if (!parsedJWT.exp || parsedJWT.exp < Date.now() / 1000) {
    return false
  }

  return true
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

// TODO: reset cookie maxAge if valid
export async function getProfileSession(
  request: Request,
  renew: boolean = true
) {
  const storage = getProfileSessionStorage()
  return storage.getSession(request.headers.get('Cookie'))
}

export async function commitProfileSession(session: Session) {
  const storage = getProfileSessionStorage()
  return storage.commitSession(session)
}
