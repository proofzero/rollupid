import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
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
import { getAccountClient } from './platform.server'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { UnauthorizedError } from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'
import type { AccountURN } from '@proofzero/urns/account'

import { FLASH_MESSAGE, FLASH_MESSAGE_KEY } from './utils/flashMessage.server'

export const InvalidSessionAccountError = new UnauthorizedError({
  message: 'Session account is not valid',
})

// FLASH SESSION

const getFlashSessionStorage = (env: Env) => {
  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
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
  const storage = getFlashSessionStorage(env)
  return storage.getSession(request.headers.get('Cookie'))
}

export function commitFlashSession(env: Env, session: Session) {
  const storage = getFlashSessionStorage(env)
  return storage.commitSession(session)
}

// USER PARAMS

const getUserSessionStorage = (
  env: Env,
  clientId?: string,
  MAX_AGE = 7776000 /*60 * 60 * 24 * 90*/
) => {
  console.log({
    clientId,
  })
  let cookieName = `_rollup_session`
  if (clientId && clientId !== 'passport' && clientId !== 'console') {
    cookieName += `_last`
  }

  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      name: cookieName,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: MAX_AGE,
      httpOnly: true,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })
}

export async function createUserSession(
  jwt: string,
  redirectTo: string,
  defaultProfileUrn: string, // NOTE: storing this temporarily in the session util RPC url remove address
  env: Env,
  clientId?: string
) {
  const userStorage = getUserSessionStorage(env, clientId)
  const parsedJWT = parseJwt(jwt)
  const userSession = await userStorage.getSession()
  userSession.set('core', parsedJWT.iss)
  userSession.set('jwt', jwt)
  userSession.set('defaultProfileUrn', defaultProfileUrn)

  const headers = new Headers()

  headers.append('Set-Cookie', await userStorage.commitSession(userSession))

  return redirect(redirectTo, {
    headers,
  })
}

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, env: Env, clientId?: string) {
  const storage = getUserSessionStorage(env, clientId)
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyUserSession(
  requestOrSession: Request | Session,
  redirectTo: string,
  env: Env,
  flashMessage: FLASH_MESSAGE,
  clientId?: string
) {
  let session
  if (requestOrSession instanceof Request) {
    session = await getUserSession(requestOrSession, env, clientId)
  } else {
    session = requestOrSession
  }
  const storage = getUserSessionStorage(env, clientId) // set max age to 0 to kill cookie

  const headers = new Headers()
  headers.append('Set-Cookie', await storage.destroySession(session))

  const flashStorage = getFlashSessionStorage(env)
  const flashSession = await flashStorage.getSession()

  flashSession.flash(FLASH_MESSAGE_KEY, flashMessage)

  headers.append('Set-Cookie', await flashStorage.commitSession(flashSession))

  return redirect(redirectTo, {
    headers,
  })
}

// CONSOLE PARAMS

const getConsoleParamsSessionStorage = (
  env: Env,
  clientId: string = 'last',
  // https://developer.chrome.com/blog/cookie-max-age-expires/
  // As of Chrome release M104 (August 2022) cookies can no longer
  // set an expiration date more than 400 days in the future.
  MAX_AGE = 34_560_000
) => {
  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      name: `_rollup_client_params_${clientId}`,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: MAX_AGE,
      httpOnly: true,
      secrets: [env.SECRET_SESSION_SALT],
    },
  })
}

export async function createConsoleParamsSession(
  consoleParams: ConsoleParams,
  env: Env
) {
  const storage = getConsoleParamsSessionStorage(env, consoleParams.clientId!)
  const session = await storage.getSession()
  session.set('params', JSON.stringify(consoleParams))

  let redirectURL = `/authenticate/${consoleParams.clientId}`
  if (consoleParams.prompt) {
    const qp = new URLSearchParams()
    qp.append('prompt', consoleParams.prompt)
    redirectURL += `?${qp.toString()}`
  }

  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    await setConsoleParamsSession(consoleParams, env, 'last')
  )
  headers.append('Set-Cookie', await storage.commitSession(session))

  return redirect(redirectURL, {
    headers,
  })
}

export async function setConsoleParamsSession(
  consoleParams: ConsoleParams,
  env: Env,
  clientId?: string
) {
  const storage = getConsoleParamsSessionStorage(env, clientId)
  const session = await storage.getSession()
  session.set('params', JSON.stringify(consoleParams))

  return storage.commitSession(session)
}

export async function getConsoleParamsSession(
  request: Request,
  env: Env,
  clientId?: string
) {
  const storage = getConsoleParamsSessionStorage(env, clientId)
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyConsoleParamsSession(
  request: Request,
  env: Env,
  clientId?: string
) {
  const gps = await getConsoleParamsSession(request, env, clientId)
  const storage = getConsoleParamsSessionStorage(env, clientId)
  return storage.destroySession(gps)
}

export type ValidatedSessionContext = {
  jwt: string
  accountUrn: AccountURN
}

export async function getValidatedSessionContext(
  request: Request,
  consoleParams: ConsoleParams,
  env: Env,
  traceSpan: TraceSpan
): Promise<ValidatedSessionContext> {
  const session = await getUserSession(
    request,
    env,
    consoleParams?.clientId ?? undefined
  )
  const jwt = session.get('jwt')

  let result: ValidatedSessionContext
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
    const redirectTo = `/authenticate/${consoleParams?.clientId ?? ''}`
    if (error === InvalidTokenError)
      if (consoleParams.clientId)
        throw await createConsoleParamsSession(consoleParams, env)
      else throw redirect(redirectTo)
    else if (
      error === ExpiredTokenError ||
      error === InvalidSessionAccountError
    ) {
      console.error(
        'Session/token error encountered. Invalidating session and redirecting to login page'
      )
      throw await destroyUserSession(
        session,
        redirectTo,
        env,
        FLASH_MESSAGE.SIGNOUT,
        consoleParams?.clientId ?? undefined
      )
    }
  }
  return result!
}

export async function getJWTConditionallyFromSession(
  request: Request,
  env: Env,
  clientId?: string
): Promise<string | undefined> {
  const session = await getUserSession(request, env, clientId)
  const jwt = session.get('jwt')

  return jwt
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}
