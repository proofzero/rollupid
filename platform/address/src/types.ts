import type {
  BaseApi,
  DurableObjectApi,
} from '@kubelt/platform.commons/src/jsonrpc'
import type { AuthorizeResult } from '@kubelt/platform.access/src/types'
import type { BaseURN } from 'urns'

export type AddressURN = BaseURN<'threeid', 'address'>

export interface Environment {
  Access: Fetcher
  Core: DurableObjectNamespace
  CryptoCore: DurableObjectNamespace
  Oort: Fetcher

  AUTH_JWT_ALG: string
  AUTH_JWT_TTL: string
  AUTH_NONCE_LENGTH: string
  AUTH_NONCE_TTL: string
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
  getAddress(): string | undefined
  setAddress(address: string): Promise<void>
  setAccount(accountUrn: string): void
  unsetAccount(): void
  resolveAccount(): Promise<string | undefined>
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
  kb_setAccount(accountUrn: string): Promise<void>
  kb_unsetAccount(): Promise<void>
  kb_resolveAccount(): Promise<string | undefined>
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
    url: string | null | undefined
    isToken: boolean
  }
  cover?: string | undefined
}
