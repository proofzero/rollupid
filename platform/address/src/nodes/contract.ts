import { ContractAddressType } from '../types'
import Address from './address'

export default class ContractAddress extends Address {
  async getType(): Promise<ContractAddressType | undefined> {
    return (await super.getType()) as ContractAddressType
  }
}
