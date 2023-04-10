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
  numberOfAttempts: 5,
  regenDelaySubsCallInMs: 0.5 * 60_000, //0.5min * 60s * 1000ms
  regenDelayFor5SubsCallsInMs: 10 * 60_000, //10min * 60s * 1000ms
  regenDelayFor5SubsCallsInMins: 10,
}
export const EDGE_ADDRESS: EdgeURN = EdgeSpace.urn('owns/address')
