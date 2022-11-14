import jose from 'jose'
import { Func } from 'typed-json-rpc'

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
  [key: string]: Func
  kb_getNonce(address: string, template: string): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): Promise<string>
  kb_isAuthenticated(): Promise<boolean>
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
