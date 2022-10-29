import jose from 'jose'

export interface KeyPair {
  publicKey: jose.KeyLike | Uint8Array
  privateKey: jose.KeyLike | Uint8Array
}

export interface KeyPairSerialized {
  publicKey: jose.JWK
  privateKey: jose.JWK
}

export type Capability = {
  read?: true
  write?: true
}

export type Capabilities = {
  [path: string]: Capability
}

export type ChallengeCapabilities = { [name: string]: string[] }
export interface Challenge {
  nonce: string
  template: string
  capabilities: ChallengeCapabilities
}

export type GetNonceParams = [string, string, ChallengeCapabilities]
export type GetNonceResult = {
  nonce: string
}

export type VerifyNonceParams = [string, string]
export type VerifyNonceResult = string

export type JWTPayload = jose.JWTPayload

export interface GenerateJWTOptions {
  payload: JWTPayload
}
