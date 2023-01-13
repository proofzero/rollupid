import { ContractAddressType } from '@kubelt/types/address'
import Address from './address'
import { DurableObjectStubProxy } from 'do-proxy'

export default class ContractAddress extends Address {
  async getType(): Promise<ContractAddressType | undefined> {
    return (await super.getType()) as ContractAddressType
  }
}
export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
