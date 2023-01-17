export enum NodeType {
  Crypto = 'crypto',
  Contract = 'contract',
  OAuth = 'oauth',
}

export enum CryptoAddressType {
  ETH = 'eth',
}

export enum ContractAddressType {
  ETH = 'eth',
}

export enum OAuthAddressType {
  Google = 'google',
  GitHub = 'github',
  Twitter = 'twitter',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType
