export enum NodeType {
  Crypto = 'crypto',
  Vault = 'vault',
  Contract = 'contract',
  OAuth = 'oauth',
  Email = 'email',
  Handle = 'handle',
}

export enum CryptoAddressType {
  ETH = 'eth',
  Wallet = 'smart_contract_wallet',
}

export enum OAuthAddressType {
  Google = 'google',
  GitHub = 'github',
  Twitter = 'twitter',
  Microsoft = 'microsoft',
  Apple = 'apple',
  Discord = 'discord',
}

export enum EmailAddressType {
  Email = 'email',
}

export enum HandleAddressType {
  Handle = 'handle',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | HandleAddressType
  | EmailAddressType
