import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { EdgeSpace } from '@proofzero/urns/edge'
import type { EdgeURN } from '@proofzero/urns/edge'

export const CODE_OPTIONS = {
  length: 24,
  ttl: 120000,
}

export const JWT_OPTIONS = {
  alg: 'ES256',
  jti: {
    length: 24,
  },
}

export const AUTHENTICATION_TOKEN_OPTIONS = {
  expirationTime: '90 days',
}

export const ACCESS_TOKEN_OPTIONS = {
  expirationTime: '1 hour',
}

/**
 * An edge linking an account node (representing a user account) and a
 * client session node for that account.
 */
export const EDGE_AUTHORIZES: EdgeURN = EdgeSpace.urn('authorizes/access')

/**
 * Internal access token URN to be used for internal service-to-service
 * communication. (e.g. between access and starbase)
 */

export const ROLLUP_INTERNAL_ACCESS_TOKEN_URN = AccountURNSpace.urn(
  'rollup_internal_access_token_urn'
) as AccountURN
