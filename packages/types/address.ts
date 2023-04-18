export enum NodeType {
  Crypto = 'crypto',
  Vault = 'vault',
  SmartContract = 'smart_contract',
  Contract = 'contract',
  OAuth = 'oauth',
  Email = 'email',
  Handle = 'handle',
}

export enum CryptoAddressType {
  ETH = 'eth',
}

export enum ContractAddressType {
  WalletETH = 'wallet_eth',
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
  | ContractAddressType
  | HandleAddressType
  | EmailAddressType
