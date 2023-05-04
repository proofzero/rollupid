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

import { encryptSession, decryptSession } from '@proofzero/utils/session'

import {
  checkToken,
  refreshAccessToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'

import type { FullProfile, RollupAuth } from '~/types'

const sessionKey = SECRET_SESSION_KEY
if (!sessionKey) {
  throw new Error('SECRET_SESSION_KEY must be set')
}

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
    result.append('scope', 'openid profile connected_accounts')
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
      return {
        accessToken: JSON.stringify(
          await encryptSession(sessionKey, accessToken)
        ),
        refreshToken: JSON.stringify(
          await encryptSession(sessionKey, refreshToken)
        ),
        extraParams,
      }
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
    const { cipher, iv } = JSON.parse(user.accessToken)
    if (!cipher || !iv) throw redirect('/auth')
    const accessToken = await decryptSession(sessionKey, cipher, iv)
    checkToken(accessToken)
    return accessToken
  } catch (error) {
    if (error === InvalidTokenError) {
      throw redirect('/signout')
    } else if (error === ExpiredTokenError) {
      try {
        const { cipher, iv } = JSON.parse(user.refreshToken)
        if (!cipher || !iv) throw redirect('/auth')
        const accessToken = await refreshAccessToken({
          tokenURL: PASSPORT_TOKEN_URL,
          refreshToken: await decryptSession(sessionKey, cipher, iv),
          clientId: PROFILE_CLIENT_ID,
          clientSecret: PROFILE_CLIENT_SECRET,
        })
        user.accessToken = JSON.stringify(
          await encryptSession(sessionKey, accessToken)
        )
        session.set('user', user)
        const cookie = await getProfileSessionStorage().commitSession(session)
        headers.append('Set-Cookie', cookie)

        if (request.method === 'GET') throw redirect(request.url, { headers })

        return accessToken
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          console.log('unauthorized refresh token')
          throw redirect('/signout')
        } else {
          console.log('unknown error occurred in refresh token request', error)
          throw error
        }
      }
    } else {
      throw redirect('/signout')
    }
  }
}

export async function isValidJWT(request: Request): Promise<boolean> {
  const session = await getProfileSession(request)
  const user = session.get('user')

  const { cipher, iv } = JSON.parse(user.accessToken)
  const jwt = await decryptSession(sessionKey, cipher, iv)

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
export async function getProfileSession(request: Request) {
  const storage = getProfileSessionStorage()
  return storage.getSession(request.headers.get('Cookie'))
}

export async function commitProfileSession(session: Session) {
  const storage = getProfileSessionStorage()
  return storage.commitSession(session)
}

export const getAccessToken = async (request: Request): Promise<string> => {
  const session = await getProfileSession(request)
  const { cipher, iv } = JSON.parse(session.get('user').accessToken)
  return decryptSession(sessionKey, cipher, iv)
}
