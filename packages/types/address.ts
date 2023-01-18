export enum NodeType {
  Crypto = 'crypto',
  Vault = 'vault',
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
  Microsoft = 'microsoft',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType
