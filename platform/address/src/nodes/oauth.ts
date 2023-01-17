import { DurableObjectStubProxy } from 'do-proxy'
import { AddressNode } from '.'
import { OAuthData } from '../types'
import Address from './address'

export default class OAuthAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async getData(): Promise<OAuthData | undefined> {
    return this.node.storage.get<OAuthData>('data')
  }

  async setData(data: OAuthData): Promise<void> {
    return this.node.storage.put('data', data)
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
