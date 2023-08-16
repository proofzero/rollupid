import { DOProxy, DurableObjectStubProxy } from 'do-proxy'

import { IdentityURN } from '@proofzero/urns/identity'
import { AccountType, NodeType } from '@proofzero/types/account'

import type { Environment } from '@proofzero/platform.core'

import ContractAccount from './contract'
import CryptoAccount from './crypto'
import OAuthAccount from './oauth'
import EmailAccount from './email'

export default class Account extends DOProxy {
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

  async getType(): Promise<AccountType | undefined> {
    return this.state.storage.get<AccountType>('type')
  }

  async setType(type: AccountType): Promise<void> {
    return this.state.storage.put('type', type)
  }

  async getIdentity(): Promise<IdentityURN | undefined> {
    return this.state.storage.get<IdentityURN>('identity')
  }

  async setIdentity(identity: IdentityURN): Promise<void> {
    return this.state.storage.put('identity', identity)
  }

  async unsetIdentity(): Promise<boolean> {
    return this.state.storage.delete('identity')
  }

  async getGradient(): Promise<string | undefined> {
    return this.state.storage.get<string>('gradient')
  }

  async setGradient(gradient: string): Promise<void> {
    return this.state.storage.put('gradient', gradient)
  }

  async getNickname(): Promise<string | undefined> {
    return this.state.storage.get<string>('nickname')
  }

  async setNickname(nickname: string): Promise<void> {
    return this.state.storage.put('nickname', nickname)
  }

  async alarm() {
    const type = await this.getNodeType()
    switch (type) {
      case NodeType.Crypto:
        return CryptoAccount.alarm(this)
      case NodeType.OAuth:
        return OAuthAccount.alarm(this)
      case NodeType.Email:
        return EmailAccount.alarm(this)
      default:
        console.log('Unknown node type', type)
    }
  }
}

export type DefaultAccountProxyStub = DurableObjectStubProxy<Account>
