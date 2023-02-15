export enum NodeType {
  Crypto = 'crypto',
  Vault = 'vault',
  Contract = 'contract',
  OAuth = 'oauth',
  Handle = 'handle',
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
  Apple = 'apple',
  Discord = 'discord',
}

export enum HandleAddressType {
  Handle = 'handle',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType
  | HandleAddressType
