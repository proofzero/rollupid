export interface Environment {
  Access: Fetcher
  CryptoAddress: DurableObjectNamespace

  ENS_RESOLVER_URL: string
  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string
}

export enum NodeType {
  Crypto = 'crypto',
}

export enum CryptoAddressType {
  Ethereum = 'ethereum',
}

export type EthereumAddressDescription = {
  address: string
  name: string
  avatar: string
  displayName: string
}

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
}

export type SetAccountParams = {
  account: string
}

export type GetNonceParams = {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
}

export type VerifyNonceParams = {
  nonce: string
  signature: string
}
