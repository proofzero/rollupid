import { RpcContext } from '@kubelt/openrpc'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  CryptoAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace
  OAuthAddress: DurableObjectNamespace

  COLLECTIONS: D1Database

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  BLOCKCHAIN_ACTIVITY: Queue
}

export interface AddressRpcContext extends RpcContext {
  NFTAR_URL: string
  BLOCKCHAIN_ACTIVITY: Queue
}

export enum NodeType {
  Crypto = 'crypto',
  Contract = 'contract',
  OAuth = 'oauth',
}

export enum CryptoAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum ContractAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum OAuthAddressType {
  Google = 'google',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
  timestamp: number
}

export type SetAccountParams = [account: string]

export type UnsetAccountParams = [account: string]

export type SetDataParams = [data: object]

export type GetNonceParams = [
  address: string,
  template: string,
  redirectUri: string,
  scope: string[],
  state: string
]

export type VerifyNonceParams = [nonce: string, signature: string]

export type AddressProfile = {
  cover: string
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
}

export type SetAddressProfileParams = [profile: Partial<AddressProfile>]
