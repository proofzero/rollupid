import { DOProxy, DurableObjectStubProxy } from 'do-proxy'

import { AccountURN } from '@kubelt/urns/account'
import { AddressURN } from '@kubelt/urns/address'
import { AddressProfile, Environment, NodeType } from '../types'
import { AddressType } from '@kubelt/types/address'
import CryptoAddress from './crypto'
import ContractAddress from './contract'
import OAuthAddress from './oauth'

export default class Address extends DOProxy {
  declare state: DurableObjectState
  declare env: Environment

  constructor(state: DurableObjectState, env: Environment) {
    super(state)
    this.state = state
    this.env = env
  }

  async getAddress(): Promise<string | undefined> {
    return this.state.storage.get<string>('address')
  }

  async setAddress(address: string): Promise<void> {
    return this.state.storage.put('address', address)
  }

  async getNodeType(): Promise<NodeType | undefined> {
    return this.state.storage.get<NodeType>('nodeType')
  }

  async setNodeType(type: NodeType): Promise<void> {
    return this.state.storage.put('nodeType', type)
  }

  async getType(): Promise<AddressType | undefined> {
    return this.state.storage.get<AddressType>('type')
  }

  async setType(type: AddressType): Promise<void> {
    return this.state.storage.put('type', type)
  }

  async getAccount(): Promise<AccountURN | undefined> {
    return this.state.storage.get<AccountURN>('account')
  }

  async setAccount(account: AccountURN): Promise<void> {
    return this.state.storage.put('account', account)
  }

  async unsetAccount(): Promise<boolean> {
    return this.state.storage.delete('account')
  }

  async getGradient(): Promise<string | undefined> {
    return this.state.storage.get<string>('gradient')
  }

  async setGradient(gradient: string): Promise<void> {
    return this.state.storage.put('gradient', gradient)
  }

  async alarm() {
    const type = await this.getNodeType()
    switch (type) {
      case NodeType.Crypto:
        return CryptoAddress.alarm(this)
      case NodeType.OAuth:
        return OAuthAddress.alarm(this)
      case NodeType.Contract:
        return ContractAddress.alarm(this)
      default:
        console.log('Unknown node type', type)
    }
  }
}

export type DefaultAddressProxyStub = DurableObjectStubProxy<Address>
