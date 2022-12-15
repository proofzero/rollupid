export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  CryptoAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  APIKEY_ALCHEMY_ETH: string
  ALCHEMY_ETH_NETWORK: string

  APIKEY_ALCHEMY_POLYGON: string
  ALCHEMY_POLYGON_NETWORK: string

  TOKEN_ALCHEMY_NOTIFY: string

  URL_ALCHEMY_WEBHOOK: string
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
