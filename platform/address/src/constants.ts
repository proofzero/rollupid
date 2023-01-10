import { EdgeSpace, EdgeURN } from '@kubelt/urns/edge'

export const HEADER_3RN = 'X-3RN'

export const ACCOUNT_OPTIONS = {
  length: 24,
}

export const NONCE_OPTIONS = {
  length: 24,
  ttl: 60,
}

export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')
