import { EdgeSpace, EdgeURN } from '@kubelt/urns/edge'

export const ACCOUNT_OPTIONS = {
  length: 24,
}

export const NONCE_OPTIONS = {
  length: 24,
  ttl: 60000,
}

export const EMAIL_VERIFICATION_OPTIONS = {
  codeLength: 6,
  //TODO: change this to 300_000 after testing
  ttlInMs: 5_000, //5min * 60s * 1000ms,
}
export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')
