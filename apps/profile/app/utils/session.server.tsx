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

import { UnauthorizedError } from '@proofzero/errors'

import {
  checkToken,
  refreshAccessToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'

import type { FullProfile, RollupAuth } from '~/types'

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

export class RollupAuthStrategy<User> extends OAuth2Strategy<
  User,
  OAuth2Profile,
  Record<string, string>
> {
  protected authorizationParams(params: URLSearchParams): URLSearchParams {
    const result = new URLSearchParams()
    result.append('scope', 'openid')
    return result
  }
}

export const getRollupAuthenticator = () => {
  const authenticator = initAuthenticator()
  const rollupStrategy = new RollupAuthStrategy(
    {
      authorizationURL: PASSPORT_AUTH_URL,
      tokenURL: PASSPORT_TOKEN_URL,
      clientID: PROFILE_CLIENT_ID,
      clientSecret: PROFILE_CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
    },
    async ({ accessToken, refreshToken, extraParams }) => {
      const parsedId = parseJwt(extraParams.id_token)

      const { sub, name, picture } = parsedId
      const profile = await ProfileKV.get(sub!, 'json')
      if (!profile) {
        const newProfile = {
          displayName: name,
          pfp: {
            image: picture,
          },
        } as FullProfile
        await ProfileKV.put(sub!, JSON.stringify(newProfile))
      }
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
  const session = await getProfileSession(request)
  const { user } = session.data
  if (!user) throw redirect('/auth')

  try {
    checkToken(user.accessToken)
    return user.accessToken
  } catch (error) {
    switch (error) {
      case InvalidTokenError:
        throw redirect('/signout')
    }

    if (error === ExpiredTokenError) {
      try {
        user.accessToken = await refreshAccessToken({
          tokenURL: PASSPORT_TOKEN_URL,
          refreshToken: user.refreshToken,
          clientId: PROFILE_CLIENT_ID,
          clientSecret: PROFILE_CLIENT_SECRET,
        })
      } catch (error) {
        if (error instanceof UnauthorizedError) throw redirect('/signout')
        else throw error
      }

      session.set('user', user)
      const cookie = await getProfileSessionStorage().commitSession(session)
      headers.append('Set-Cookie', cookie)

      if (request.method === 'GET') throw redirect(request.url, { headers })

      return user.accessToken
    } else {
      throw redirect('/signout')
    }
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
