// @threeid/platform.starbase:src/token.ts

import * as _ from 'lodash'

import * as jose from 'jose'

import { HEADER_ACCESS_TOKEN } from './constants'

import type { AccountURN } from '@kubelt/urns/account'

import { AccountURNSpace } from '@kubelt/urns/account'

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
  return request.headers.get(HEADER_ACCESS_TOKEN) || ''
}

// getUserId()
// -----------------------------------------------------------------------------

/**
 * Extract the user ID from a JWT token.
 *
 * @param token - A JWT token string
 */
export function getAccountId(token: string): AccountURN {
  if (token === '') {
    throw new Error('invalid empty token provided')
  }

  const decoded = jose.decodeJwt(token)
  // The unique user ID can be found in the JWT 'sub' field.
  const userId = decoded?.sub ? decoded.sub : ''

  // The user URN is provided as the 'subject' JWT claim.
  if (_.isUndefined(userId) || userId === '') {
    throw new Error('missing account ID in JWT')
  }

  // Validate user ID as an AccountURN.
  let accountURN: AccountURN
  if (!AccountURNSpace.is(userId)) {
    throw new Error('invalid account ID in JWT')
  } else {
    accountURN = userId
  }

  return accountURN
}
