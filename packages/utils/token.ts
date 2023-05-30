import * as jose from 'jose'

import { RollupError, UnauthorizedError } from '@proofzero/errors'

import { getErrorCause } from './errors'

export const InvalidTokenError = new RollupError({
  message: 'invalid token',
})

export const ExpiredTokenError = new UnauthorizedError({
  message: 'expired token',
})

interface CheckTokenFunction {
  (token: string): jose.JWTPayload
}

export const checkToken: CheckTokenFunction = (token) => {
  try {
    const payload = jose.decodeJwt(token)
    if (payload.exp) {
      const expirationTime = payload.exp * 1000
      if (expirationTime < Date.now()) throw ExpiredTokenError
    }
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
