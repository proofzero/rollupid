import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { DurableObject } from '@kubelt/platform.commons'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { ADDRESS_OPTIONS } from './constants'
import { AddressCoreApi, Environment, CryptoCoreApi } from './types'

export default class Core extends DurableObject<
  Environment,
  AddressCoreApi | CryptoCoreApi
> {
  address: string | undefined
  coreApi: AddressCoreApi = {
    getType: this.getType.bind(this),
    setType: this.setType.bind(this),
    getName: this.getName.bind(this),
    setName: this.setName.bind(this),
    getAddress: this.getAddress.bind(this),
    setAddress: this.setAddress.bind(this),
    setAccount: this.setAccount.bind(this),
    unsetAccount: this.unsetAccount.bind(this),
    resolveAccount: this.resolveAccount.bind(this),
  }

  methods(): AddressCoreApi | CryptoCoreApi {
    return this.coreApi
  }

  async getAddress(): Promise<string | undefined> {
    return this.address || this.getName() || (await this.storage.get('address'))
  }

  async setAddress(address: string): Promise<void> {
    this.setName(address)
    this.address = address
    await this.storage.put({ address })
  }

  async getAccount(): Promise<string | undefined> {
    const account = await this.storage.get<string>('account')
    if (account && !AccountURNSpace.is(account)) {
      const urn = AccountURNSpace.urn(account)
      await this.setAccount(urn)
      return urn
    } else {
      return account
    }
  }

  async setAccount(account: AccountURN): Promise<void> {
    await this.storage.put({ account })
  }

  async unsetAccount(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolveAccount(): Promise<AccountURN> {
    const urn = await this.getAccount()
    if (urn) {
      console.log({ urn })
      if (AccountURNSpace.is(urn)) {
        return urn
      } else {
        throw `invalid account: ${urn}`
      }
    } else {
      const id = hexlify(randomBytes(ADDRESS_OPTIONS.length))
      const urn = AccountURNSpace.urn(id)
      await this.setAccount(urn)
      return urn
    }
  }
}
