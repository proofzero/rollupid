import { DOProxy } from 'do-proxy'

import { AccountURN } from '@kubelt/urns/account'
import { AddressURN } from '@kubelt/urns/address'
import { AddressProfile } from '../types'
import type { AddressType } from '@kubelt/types/address'

export default class Address extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getAddress(): Promise<AddressURN | undefined> {
    return this.state.storage.get<AddressURN>('address')
  }

  async setAddress(address: AddressURN): Promise<void> {
    return this.state.storage.put('address', address)
  }

  async getType(): Promise<AddressType | undefined> {
    return await this.state.storage.get<AddressType>('type')
  }

  async setType(type: AddressType): Promise<void> {
    return await this.state.storage.put('type', type)
  }

  async getAccount(): Promise<AccountURN | undefined> {
    return await this.state.storage.get<AccountURN>('account')
  }

  async setAccount(account: AccountURN): Promise<void> {
    return this.state.storage.put('account', account)
  }

  async unsetAccount(): Promise<boolean> {
    return this.state.storage.delete('account')
  }

  async getProfile(): Promise<AddressProfile | undefined> {
    return this.state.storage.get<AddressProfile>('profile')
  }

  async setProfile<TProfile>(profile: TProfile): Promise<void> {
    const p = (await this.state.storage.get<TProfile>('profile')) || {}
    Object.assign(p, profile)
    return this.state.storage.put('profile', p)
  }
}
