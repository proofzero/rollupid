import { OAuthAddressType } from '../types'
import Address from './address'

export default class OAuthAddress extends Address {
  async getType(): Promise<OAuthAddressType> {
    return (await super.getType()) as OAuthAddressType
  }

  async getData<Data>(): Promise<Data | undefined> {
    return await this.state.storage.get<Data>('data')
  }

  async setData<Data>(data: Data): Promise<void> {
    return await this.state.storage.put('data', data)
  }
}
