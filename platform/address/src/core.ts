import { BytesLike } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { DurableObject } from '@kubelt/platform.commons'

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

  async setAccount(account: string): Promise<void> {
    await this.storage.put({ account })
  }

  async unsetAccount(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolveAccount(): Promise<string | undefined> {
    return this.storage.get<string>('account')
  }

  recoverPublicKey(message: string, signature: string): string {
    const prefix = `\u0019Ethereum Signed Message:\n${message.length}`
    const encoder = new TextEncoder()
    const bytes = encoder.encode(`${prefix}${message}`)
    const digest = keccak256(bytes)
    return recoverPublicKey(digest, signature)
  }

  computeAddress(publicKey: BytesLike): string {
    return computeAddress(publicKey)
  }
}
