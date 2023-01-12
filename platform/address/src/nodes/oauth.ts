import { OAuthData } from '../types'
import Address from './address'
import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthAddressType} from '@kubelt/types/address'

export default class OAuthAddress extends Address {
  async getType(): Promise<OAuthAddressType> {
    return (await super.getType()) as OAuthAddressType
  }

  async getData(): Promise<OAuthData | undefined> {
    return this.state.storage.get<OAuthData>('data')
  }

  async setData(data: OAuthData): Promise<void> {
    return this.state.storage.put('data', data)
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
