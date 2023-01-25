import { EdgeSpace } from '@kubelt/urns/edge'
import type { EdgeURN } from '@kubelt/urns/edge'

export const URN_NODE_TYPE_AUTHORIZATION = 'node_type:authorization'

export const CODE_OPTIONS = {
  length: 24,
  ttl: 120000,
}

export const JWT_OPTIONS = {
  alg: 'ES256',
  jti: {
    length: 24,
  },
  ttl: 2592000,
}

/**
 * An edge linking an account node (representing a user account) and a
 * client session node for that account.
 */
export const EDGE_ACCESS: EdgeURN = EdgeSpace.urn('owns/access')
