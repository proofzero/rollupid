import { EdgeSpace, EdgeURN } from '@kubelt/urns/edge'

export const ACCOUNT_OPTIONS = {
  length: 24,
}

export const NONCE_OPTIONS = {
  length: 24,
  ttl: 60000,
}

export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')
