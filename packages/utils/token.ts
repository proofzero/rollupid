import * as jose from 'jose'

import { RollupError, UnauthorizedError } from '@proofzero/errors'

import { getErrorCause } from './errors'

export const InvalidTokenError = new RollupError({
  message: 'invalid token',
})

export const ExpiredTokenError = new UnauthorizedError({
  message: 'expired token',
})

interface VerifyTokenFunction {
  (
    token: string,
    jwksInternalUrlBase: string,
    request: Request
  ): Promise<jose.JWTPayload>
}

export const verifyToken: VerifyTokenFunction = async (
  token: string,
  jwksInternalUrlBase: string,
  request: Request
) => {
  try {
    const cache = caches.default
    const jwtHeader = jose.decodeProtectedHeader(token)
    const jwtPayload = jose.decodeJwt(token)
    if (!jwtPayload.iss || !jwtHeader.kid) throw InvalidTokenError
    const reqUrl = new URL(request.url)
    const issuerHostname = new URL(jwtPayload.iss).host
    //@ts-ignore
    let passportFetcher = globalThis.Passport as Fetcher
    console.debug('\n\nPassport fetcher', passportFetcher)
    let jwksLookupUrl =
      reqUrl.host === issuerHostname
        ? 'http://localhost:10001/.well-known/jwks.json'
        : jwksInternalUrlBase
    //jwksLookupUrl.searchParams.append('issuer_hostname', issuerHostname)
    jwksLookupUrl += `?issuer_hostname=${issuerHostname}`
    let lookupFetcher =
      reqUrl.host === issuerHostname && passportFetcher
        ? passportFetcher.fetch.bind(passportFetcher)
        : fetch

    console.debug(
      '\n\n\nURL:',
      reqUrl.host,
      issuerHostname,
      jwksLookupUrl,
      passportFetcher,
      lookupFetcher
    )
    let jwks: jose.JSONWebKeySet
    const cacheMatch = await cache.match(jwksLookupUrl)
    if (cacheMatch) {
      jwks = await cacheMatch.json()
      //TODO: Remove after validating it after deployment
      console.debug('matched cache')
    } else {
      const jwksResponse = await lookupFetcher(jwksLookupUrl)
      if (!jwksResponse.ok) {
        console.error(
          `Error from fetch`,
          jwksResponse.status,
          jwksResponse.statusText
        )
        console.error(`Could not retrieve the JWKS from ${jwksLookupUrl}`)
        throw InvalidTokenError
      }
      //Don't need to await as it's an optimistic put
      cache.put(jwksLookupUrl, jwksResponse.clone())
      jwks = await jwksResponse.json()
    }

    const verificationKey = await jose.createLocalJWKSet(jwks)
    const { protectedHeader, payload } = await jose.jwtVerify(
      token,
      verificationKey,
      {}
    )
    return payload
  } catch (error) {
    if (error instanceof RollupError) throw error
    else if (error instanceof jose.errors.JWTInvalid) throw InvalidTokenError
    else {
      console.error(error)
      throw InvalidTokenError
    }
  }
}

type RefreshTokenOptions = {
  tokenURL: string
  refreshToken: string
  clientId: string
  clientSecret: string
}

type RefreshTokenExchangeResult = {
  access_token: string
}

interface RefreshAccessTokenFunction {
  (options: RefreshTokenOptions): Promise<string>
}

export const refreshAccessToken: RefreshAccessTokenFunction = async ({
  tokenURL,
  refreshToken,
  clientId,
  clientSecret,
}) => {
  const method = 'POST'
  const body = new FormData()
  body.set('grant_type', 'refresh_token')
  body.set('refresh_token', refreshToken)
  body.set('client_id', clientId)
  body.set('client_secret', clientSecret)

  const response = await fetch(tokenURL, { method, body })
  if (!response.ok) {
    const body = await response.json()
    throw getErrorCause(body)
  }

  const { access_token } = await response.json<RefreshTokenExchangeResult>()
  return access_token
}
