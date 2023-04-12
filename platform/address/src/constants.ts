import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'

export const ACCOUNT_OPTIONS = {
  length: 24,
}

export const NONCE_OPTIONS = {
  length: 24,
  ttl: 60000,
}

export const EMAIL_VERIFICATION_OPTIONS = {
  codeLength: 6,
  stateLength: 12, //Why 12? Why not..
  ttlInMs: 300_000, //5min * 60s * 1000ms,
  maxAttempts: 5,
  regenDelaySubsCallInMs: 0.5 * 60_000, //0.5min * 60s * 1000ms
  regenDelayForMaxAttepmtsInMs: 10 * 60_000, //10min * 60s * 1000ms
  maxAttempsTimePeriod: 5 * 60_000, // 5 calls within 5 minutes
}
export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')
