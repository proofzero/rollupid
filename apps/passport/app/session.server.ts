import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from '@remix-run/cloudflare'
import type { Session } from '@remix-run/cloudflare'

import * as jose from 'jose'
import type { JWTPayload } from 'jose'

import {
  checkToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'

import { encryptSession, decryptSession } from '@proofzero/utils/session'

import { getAccountClient } from './platform.server'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { InternalServerError, UnauthorizedError } from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'
import type { AccountURN } from '@proofzero/urns/account'

import { FLASH_MESSAGE, FLASH_MESSAGE_KEY } from './utils/flashMessage.server'
import { getCookieDomain } from './utils/cookie'

export const InvalidSessionAccountError = new UnauthorizedError({
  message: 'Session account is not valid',
})

// FLASH SESSION

const getFlashSessionStorage = (request: Request, env: Env) => {
  return createCookieSessionStorage({
    cookie: {
      domain: getCookieDomain(request, env),
      name: '_rollup_flash',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: 10,
      httpOnly: true,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })
}

export function getFlashSession(request: Request, env: Env) {
  const storage = getFlashSessionStorage(request, env)
  return storage.getSession(request.headers.get('Cookie'))
}

export function commitFlashSession(
  request: Request,
  env: Env,
  session: Session
) {
  const storage = getFlashSessionStorage(request, env)
  return storage.commitSession(session)
}

// USER PARAMS

const getUserSessionStorage = (
  request: Request,
  env: Env,
  clientId?: string,
  MAX_AGE = 7776000 /*60 * 60 * 24 * 90*/
) => {
  let cookieName = `_rollup_session`
  if (clientId && clientId !== 'passport' && clientId !== 'console') {
    cookieName += `_last`
  }

  return createCookie(cookieName, {
    domain: getCookieDomain(request, env),
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV == 'production',
    maxAge: MAX_AGE,
    httpOnly: true,
  })
}

export async function createUserSession(
  request: Request,
  jwt: string,
  redirectTo: string,
  env: Env,
  clientId?: string
) {
  const cookie = getUserSessionStorage(request, env, clientId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await cookie.serialize(
        await encryptSession(env.SECRET_SESSION_KEY, jwt)
      ),
    },
  })
}

export async function getUserSession(
  request: Request,
  env: Env,
  clientId?: string
) {
  const cookie = getUserSessionStorage(request, env, clientId)
  const data = await cookie.parse(request.headers.get('Cookie'))
  if (!data) return ''

  if (typeof data === 'object' && data.cipher && data.iv) {
    try {
      return await decryptSession(env.SECRET_SESSION_KEY, data.cipher, data.iv)
    } catch (error) {
      console.error('getUserSession:decryptSession()', error)
    }
  }

  return ''
}

export async function destroyUserSession(
  request: Request,
  redirectTo: string,
  env: Env,
  flashMessage: FLASH_MESSAGE,
  clientId?: string
) {
  const headers = new Headers()

  const cookie = await getUserSessionStorage(request, env, clientId)
  headers.append(
    'Set-Cookie',
    await cookie.serialize('', { expires: new Date(0) })
  )

  const flashStorage = getFlashSessionStorage(request, env)
  const flashSession = await flashStorage.getSession()
  flashSession.flash(FLASH_MESSAGE_KEY, flashMessage)
  headers.append('Set-Cookie', await flashStorage.commitSession(flashSession))

  return redirect(redirectTo, { headers })
}

const getAuthzCookieParamsSessionStorage = (
  request: Request,
  env: Env,
  clientId: string = 'last',
  // https://developer.chrome.com/blog/cookie-max-age-expires/
  // As of Chrome release M104 (August 2022) cookies can no longer
  // set an expiration date more than 400 days in the future.
  MAX_AGE = 34_560_000
) => {
  return createCookieSessionStorage({
    cookie: {
      domain: getCookieDomain(request, env),
      name: `_rollup_authz_params_${clientId}`,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: MAX_AGE,
      httpOnly: true,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })
}

/** Creates an authorization cookie, capturing current authz query params,
 * and redirects to the authentication route
 */
export async function createAuthzParamsCookieAndAuthenticate(
  request: Request,
  authzQueryParams: AuthzParams,
  env: Env,
  qp: URLSearchParams = new URLSearchParams()
) {
  let redirectURL = `/authenticate/${authzQueryParams.clientId}${
    ['connect', 'reconnect'].includes(authzQueryParams.rollup_action || '')
      ? ''
      : `/account`
  }`

  if (authzQueryParams.prompt) {
    qp.append('prompt', authzQueryParams.prompt)
  }
  if (authzQueryParams.login_hint) {
    qp.append('login_hint', authzQueryParams.login_hint)
  }
  if (authzQueryParams.rollup_action)
    qp.append('rollup_action', authzQueryParams.rollup_action)

  redirectURL += `?${qp.toString()}`

  throw redirect(redirectURL, {
    headers: await createAuthorizationParamsCookieHeaders(
      request,
      authzQueryParams,
      env
    ),
  })
}

export async function createAuthorizationParamsCookieHeaders(
  request: Request,
  authzParams: AuthzParams,
  env: Env
) {
  if (!authzParams.clientId) {
    throw new InternalServerError({
      message: 'Missing clientId in authorization parameters',
    })
  }

  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    await setAuthzCookieParamsSession(
      request,
      authzParams,
      env,
      authzParams.clientId
    )
  )
  headers.append(
    'Set-Cookie',
    await setAuthzCookieParamsSession(request, authzParams, env)
  )

  return headers
}

export async function setAuthzCookieParamsSession(
  request: Request,
  authzParams: AuthzParams,
  env: Env,
  clientId?: string
) {
  const storage = getAuthzCookieParamsSessionStorage(request, env, clientId)
  const session = await storage.getSession()

  //Convert string array scope to space-delimited scope before setting cookie value
  const { scope, ...otherProps } = authzParams
  const externalEncodedCP = { ...otherProps, scope: scope?.join(' ') || '' }
  session.set('params', JSON.stringify(externalEncodedCP))

  return storage.commitSession(session)
}

export async function getAuthzCookieParamsSession(
  request: Request,
  env: Env,
  clientId?: string
) {
  const storage = getAuthzCookieParamsSessionStorage(request, env, clientId)
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyAuthzCookieParamsSession(
  request: Request,
  env: Env,
  clientId?: string
) {
  const gps = await getAuthzCookieParamsSession(request, env, clientId)
  const storage = getAuthzCookieParamsSessionStorage(request, env, clientId)
  return storage.destroySession(gps)
}

export async function getAuthzCookieParams(
  request: Request,
  env: Env,
  clientId?: string
): Promise<AuthzCookieParams> {
  return getAuthzCookieParamsSession(request, env, clientId)
    .then((session) => {
      const externalEncodedCookie = JSON.parse(session.get('params'))
      //Convert space-delimited scope to string array
      const { scope, ...otherProps } = externalEncodedCookie
      return {
        ...otherProps,
        scope: scope.trim().length ? scope.split(' ') : [],
      }
    })
    .catch((err) => {
      console.log('No authorization cookie params found')
      throw new InternalServerError({
        message: 'No authorization cookie params found',
      })
    })
}

export function getDefaultAuthzParams(request: Request): AuthzParams {
  const url = new URL(request.url)
  const { protocol, host } = url

  const cp = {
    clientId: 'passport',
    redirectUri: `${protocol}//${host}/settings`,
    state: 'skip',
    scope: [],
  }

  return cp
}

export type ValidatedSessionContext = {
  jwt: string
  accountUrn: AccountURN
}

export async function getValidatedSessionContext(
  request: Request,
  authzParams: AuthzParams,
  env: Env,
  traceSpan: TraceSpan
): Promise<ValidatedSessionContext> {
  const jwt = await getUserSession(
    request,
    env,
    authzParams?.clientId ?? undefined
  )

  try {
    const payload = checkToken(jwt)
    const accountClient = getAccountClient(jwt, env, traceSpan)
    if (
      !AccountURNSpace.is(payload.sub!) ||
      !(await accountClient.isValid.query())
    )
      throw InvalidSessionAccountError
    return {
      jwt,
      accountUrn: payload.sub as AccountURN,
    }
  } catch (error) {
    // TODO: Revise this logic
    const redirectTo = `/authenticate/${authzParams?.clientId}`
    if (error === InvalidTokenError)
      if (authzParams.clientId)
        throw await createAuthzParamsCookieAndAuthenticate(
          request,
          authzParams,
          env
        )
      else throw redirect(redirectTo)
    else if (
      error === ExpiredTokenError ||
      error === InvalidSessionAccountError
    ) {
      console.error(
        'Session/token error encountered. Invalidating session and redirecting to login page'
      )
      throw await destroyUserSession(
        request,
        redirectTo,
        env,
        FLASH_MESSAGE.SIGNOUT,
        authzParams?.clientId ?? undefined
      )
    } else
      throw new InternalServerError({
        message: 'Unexpected session error',
        cause: error,
      })
  }
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw InvalidTokenError
  }
  return payload
}
