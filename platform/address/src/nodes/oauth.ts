import { OAuthAddressType, OAuthDataSchema, OAuthGoogleProfile } from '../types'
import Address from './address'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressURN } from '@kubelt/urns/address'
import { AccountURN } from '@kubelt/urns/account'

export default class OAuthAddress extends Address {
  async getType(): Promise<OAuthAddressType> {
    return (await super.getType()) as OAuthAddressType
  }

  async getData(): Promise<OAuthDataSchema | undefined> {
    return await this.state.storage.get<OAuthDataSchema>('data')
  }

  async setData(data: OAuthDataSchema): Promise<void> {
    return await this.state.storage.put('data', data)
  }

  // parent methods
  async getAddress(): Promise<AddressURN | undefined> {
    return super.getAddress()
  }

  async setAddress(address: AddressURN): Promise<void> {
    return super.setAddress(address)
  }

  async setType(type: OAuthAddressType): Promise<void> {
    return super.setType(type)
  }

  async resolveAccount(): Promise<AccountURN> {
    return super.resolveAccount()
  }

  async setAccount(account: AccountURN): Promise<void> {
    return super.setAccount(account)
  }

  async unsetAccount(): Promise<boolean> {
    return super.unsetAccount()
  }

  // TODO: union type for oauth profiles
  async getProfile(): Promise<OAuthGoogleProfile | undefined> {
    return super.getProfile() as Promise<OAuthGoogleProfile | undefined>
  }

  async setProfile<TProfile>(profile: TProfile): Promise<void> {
    return super.setProfile(profile)
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
