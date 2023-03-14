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
} from '@kubelt/utils/token'

// FLASH SESSION

const getFlashSessionStorage = (env: Env) => {
  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      name: 'PASSPORT_FLASH',
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
  MAX_AGE = 7776000 /*60 * 60 * 24 * 90*/
) => {
  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      name: 'PASSPORT_SESSION',
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
  env: Env
) {
  const userStorage = getUserSessionStorage(env)
  const parsedJWT = parseJwt(jwt)
  const userSession = await userStorage.getSession()
  userSession.set('core', parsedJWT.iss)
  userSession.set('jwt', jwt)
  userSession.set('defaultProfileUrn', defaultProfileUrn)

  const consoleParamsStorage = getConsoleParamsSessionStorage(env)
  const consoleParamsSession = await consoleParamsStorage.getSession()

  const headers = new Headers()
  headers.append('Set-Cookie', await userStorage.commitSession(userSession))
  headers.append(
    'Set-Cookie',
    await consoleParamsStorage.destroySession(consoleParamsSession)
  )

  return redirect(redirectTo, {
    headers,
  })
}

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, env: Env) {
  const storage = getUserSessionStorage(env)
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyUserSession(
  session: Session,
  redirectTo: string,
  env: Env,
  manualLogout: boolean = false
) {
  const storage = getUserSessionStorage(env, 0) // set max age to 0 to kill cookie

  const headers = new Headers()
  headers.append('Set-Cookie', await storage.destroySession(session))

  if (manualLogout) {
    const flashStorage = getFlashSessionStorage(env)
    const flashSession = await flashStorage.getSession()
    flashSession.flash('SIGNOUT', 'true')

    headers.append('Set-Cookie', await flashStorage.commitSession(flashSession))
  }

  return redirect(redirectTo, {
    headers,
  })
}

export async function logout(request: Request, redirectTo: string, env: Env) {
  const session = await getUserSession(request, env)
  return destroyUserSession(session, redirectTo, env, true)
}

// CONSOLE PARAMS

const getConsoleParamsSessionStorage = (
  env: Env,
  // https://developer.chrome.com/blog/cookie-max-age-expires/
  // As of Chrome release M104 (August 2022) cookies can no longer
  // set an expiration date more than 400 days in the future.
  MAX_AGE = 34_560_000
) => {
  return createCookieSessionStorage({
    cookie: {
      domain: env.COOKIE_DOMAIN,
      name: 'CONSOLE_PARAMS_SESSION',
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
  const storage = getConsoleParamsSessionStorage(env)
  const session = await storage.getSession()
  session.set('params', JSON.stringify(consoleParams))

  return redirect('/authenticate', {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function setConsoleParamsSession(
  consoleParams: ConsoleParams,
  env: Env
) {
  const storage = getConsoleParamsSessionStorage(env)
  const session = await storage.getSession()
  session.set('params', JSON.stringify(consoleParams))

  return storage.commitSession(session)
}

export async function getConsoleParamsSession(request: Request, env: Env) {
  const storage = getConsoleParamsSessionStorage(env)
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyConsoleParamsSession(request: Request, env: Env) {
  const gps = await getConsoleParamsSession(request, env)
  const storage = getConsoleParamsSessionStorage(env)
  return storage.destroySession(gps)
}

export async function requireJWT(
  request: Request,
  consoleParams: ConsoleParams,
  env: Env
) {
  const session = await getUserSession(request, env)
  const jwt = session.get('jwt')

  try {
    checkToken(jwt)
    return jwt
  } catch (error) {
    if (error === InvalidTokenError)
      if (consoleParams.clientId)
        throw await createConsoleParamsSession(consoleParams, env)
      else throw redirect('/authenticate')
    else if (error === ExpiredTokenError) {
      throw await destroyUserSession(session, '/authenticate', env)
    }
  }
}

export async function getJWTConditionallyFromSession(
  request: Request,
  env: Env
): Promise<string | undefined> {
  const session = await getUserSession(request, env)
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
