import type {
  BaseApi,
  DurableObjectApi,
} from '@kubelt/platform.commons/src/jsonrpc'

import type { AccountURN } from '@kubelt/urns/account'
import type { AuthorizeResult } from '@kubelt/platform.access/src/types'

export interface Environment {
  Access: Fetcher
  Core: DurableObjectNamespace
  CryptoCore: DurableObjectNamespace
  Oort: Fetcher

  AUTH_JWT_ALG: string
  AUTH_JWT_TTL: string
  AUTH_NONCE_LENGTH: string
  AUTH_NONCE_TTL: string

  NFTAR_URL: string
  NFTAR_AUTHORIZATION: string
  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  NFTAR_TOKEN: string

  ENS_RESOLVER_URL: string
}

export interface Challenge {
  nonce: string
  template: string
  clientId: string
  redirectUri: string
  scope: string[]
  state: string
}

export interface AddressCoreApi extends DurableObjectApi {
  getAddress(): Promise<string | undefined>
  setAddress(address: string): Promise<void>
  setAccount(accountUrn: string): void
  unsetAccount(): void
  resolveAccount(): Promise<AccountURN>
  getAccount(): Promise<AccountURN | undefined>
}

export interface CryptoCoreApi extends AddressCoreApi {
  getNonce(
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  verifyNonce(nonce: string, signature: string): Promise<Challenge>
  setProfile(profile: AddressProfile): void
  getProfile(): Promise<AddressProfile | undefined>
  setPfpVoucher(voucher: object): void
  getPfpVoucher(): object | undefined
}

export interface WorkerApi extends BaseApi {
  kb_getAccount(): Promise<AccountURN | undefined>
  kb_setAccount(accountUrn: AccountURN): Promise<void>
  kb_unsetAccount(): Promise<void>
  kb_resolveAccount(): Promise<AccountURN>
}

export interface CryptoWorkerApi extends WorkerApi {
  kb_getNonce(
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): Promise<AuthorizeResult>
  kb_setAddressProfile(profile: AddressProfile): Promise<void>
  kb_getAddressProfile(): Promise<AddressProfile | undefined>
  kb_getPfpVoucher(): Promise<object | undefined>
}

export enum CryptoCoreType {
  Crypto = 'crypto',
}
export enum SocialCoreType {
  Social = 'social',
}
export type CoreType = CryptoCoreType | SocialCoreType

export enum CryptoAddressType {
  ETHEREUM = 'ethereum',
  ETH = 'eth',
}
export enum SocialAddressType {
  TWITTER = 'twitter',
  GOOGLE = 'google',
  APPLE = 'apple',
}
export type EmailAddressType = 'email'
export type AddressType =
  | CryptoAddressType
  | SocialAddressType
  | EmailAddressType

export type AddressProfile = {
  displayName: string
  pfp: {
    image: string
    isToken: boolean
  }
  cover?: string | undefined
}
