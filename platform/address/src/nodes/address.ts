import { DOProxy } from 'do-proxy'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { ACCOUNT_OPTIONS } from '../constants'
import { AddressURN } from '@kubelt/urns/address'
import { AddressProfile, AddressType } from '../types'

export default class Address extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getAddress(): Promise<AddressURN | undefined> {
    return await this.state.storage.get<AddressURN>('address')
  }

  async setAddress(address: AddressURN): Promise<void> {
    return await this.state.storage.put('address', address)
  }

  async getType(): Promise<AddressType | undefined> {
    return await this.state.storage.get<AddressType>('address')
  }

  async setType(type: AddressType): Promise<void> {
    return await this.state.storage.put('type', type)
  }

  async resolveAccount(): Promise<AccountURN> {
    const stored = await this.state.storage.get<AccountURN>('account')
    if (stored) {
      if (AccountURNSpace.is(stored)) {
        return stored
      } else {
        const urn = AccountURNSpace.urn(stored)
        await this.state.storage.put('account', urn)
        return urn
      }
    } else {
      const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
      const urn = AccountURNSpace.urn(name)
      await this.state.storage.put('account', urn)
      return urn
    }
  }

  async getAccount(): Promise<AccountURN | undefined> {
    return await this.state.storage.get<AccountURN>('account')
  }

  async setAccount(account: AccountURN): Promise<void> {
    return await this.state.storage.put('account', account)
  }

  async unsetAccount(): Promise<boolean> {
    return await this.state.storage.delete('account')
  }

  async getData<Data>(): Promise<Data | undefined> {
    return await this.state.storage.get<Data>('data')
  }

  async setData<Data>(data: Data): Promise<void> {
    return await this.state.storage.put('data', data)
  }

  async getProfile(): Promise<AddressProfile | undefined> {
    return await this.state.storage.get<AddressProfile>('profile')
  }

  async setProfile(profile: AddressProfile): Promise<void> {
    const p = (await this.state.storage.get<AddressProfile>('profile')) || {}
    Object.assign(p, profile)
    return await this.state.storage.put('profile', p)
  }
}
