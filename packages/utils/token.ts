import * as jose from 'jose'

export const InvalidTokenError = new Error('invalid token')
export const ExpiredTokenError = new Error('expired token')

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
    throw InvalidTokenError
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
    throw new Error('refresh token request failed', {
      cause: await response.text(),
    })
  }

  const { access_token } = await response.json<RefreshTokenExchangeResult>()
  return access_token
}
