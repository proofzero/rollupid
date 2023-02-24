import { EdgeSpace } from '@kubelt/urns/edge'
import type { EdgeURN } from '@kubelt/urns/edge'

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
