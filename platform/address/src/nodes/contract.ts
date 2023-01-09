import { ContractAddressType } from '../types'
import Address from './address'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressURN } from '@kubelt/urns/address'
import { AccountURN } from '@kubelt/urns/account'

export default class ContractAddress extends Address {
  async getType(): Promise<ContractAddressType | undefined> {
    return (await super.getType()) as ContractAddressType
  }

  // parent methods
  async getAddress(): Promise<AddressURN | undefined> {
    return super.getAddress()
  }

  async setAddress(address: AddressURN): Promise<void> {
    return super.setAddress(address)
  }

  async setType(type: ContractAddressType): Promise<void> {
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

  async setProfile<TProfile>(profile: TProfile): Promise<void> {
    return super.setProfile(profile)
  }
}
export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
