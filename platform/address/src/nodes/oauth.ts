import { OAuthAddressType, OAuthDataSchema } from '../types'
import Address from './address'
import { DurableObjectStubProxy } from 'do-proxy'

export default class OAuthAddress extends Address {
  async getType(): Promise<OAuthAddressType> {
    return (await super.getType()) as OAuthAddressType
  }

  async getData(): Promise<OAuthDataSchema | undefined> {
    return await this.state.storage.get<OAuthDataSchema>('data')
  }

  async setData(data: OAuthDataSchema): Promise<void> {
    return await this.state.storage.put('data', data)
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
