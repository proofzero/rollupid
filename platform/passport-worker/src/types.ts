import jose from 'jose'

export interface KeyPair {
  publicKey: jose.KeyLike | Uint8Array
  privateKey: jose.KeyLike | Uint8Array
}

export interface KeyPairSerialized {
  publicKey: jose.JWK
  privateKey: jose.JWK
}

export interface Environment {
  Address: Fetcher
  Core: DurableObjectNamespace
}

export interface Api {
  kb_getNonce(address: string, template: string): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): Promise<string>
  kb_isAuthenticated(token: string): Promise<boolean>
}

export type GetNonceResult = {
  nonce: string
}

export interface Challenge {
  address: string
  nonce: string
  template: string
}

export interface GenerateJWTOptions {
  payload: jose.JWTPayload
}
