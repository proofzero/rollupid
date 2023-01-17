import { DurableObjectStubProxy } from 'do-proxy'
import Address from './address'

export default class ContractAddress {
  declare node: Address

  constructor(node: Address) {
    this.node = node
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}
export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
