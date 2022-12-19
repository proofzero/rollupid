import { RpcContext } from '@kubelt/openrpc'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  CryptoAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace

  COLLECTIONS: D1Database

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  APIKEY_ALCHEMY_ETH: string
  ALCHEMY_ETH_NETWORK: string

  APIKEY_ALCHEMY_POLYGON: string
  ALCHEMY_POLYGON_NETWORK: string

  APIKEY_MORALIS: string
  MORALIS_STREAM_ID: string
  URL_MORALIS_WEBHOOK: string
}

export interface AddressRpcContext extends RpcContext {
  collectionDB: DrizzleD1Database
}

export enum NodeType {
  Crypto = 'crypto',
  Contract = 'contract',
}

export enum CryptoAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
  timestamp: number
}

export type SetAccountParams = [account: string]

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
    isToken: string
  }
}

export type SetAddressProfileParams = [profile: Partial<AddressProfile>]
