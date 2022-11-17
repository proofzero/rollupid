// @kubelt/platform.starbase:src/token.ts

import * as jose from 'jose'

import { HEADER_CORE_AUTHENTICATION } from '@kubelt/platform.commons/src/constants'

// fromRequest()
// -----------------------------------------------------------------------------

/**
 * Extract the JWT from an incoming request.
 *
 * @param request - an HTTP request
 *
 * @returns the JWT associated with the request
 */
export function fromRequest(request: Request): string {
  return request.headers.get(HEADER_CORE_AUTHENTICATION) || ''
}

// getUserId()
// -----------------------------------------------------------------------------

/**
 * Extract the user ID from a JWT token.
 *
 * @param token - A JWT token string
 */
export function getUserId(token: string): string {
  if (token === '') {
    return ''
  }

  const decoded = jose.decodeJwt(token)
  // The unique user ID can be found in the JWT 'sub' field.
  return decoded?.sub ? decoded.sub : ''
}
