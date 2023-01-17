import { DOProxy, DurableObjectStubProxy } from 'do-proxy'
import { OAuthData } from '../types'

export default class OAuthAddress extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getData(): Promise<OAuthData | undefined> {
    return this.state.storage.get<OAuthData>('data')
  }

  async setData(data: OAuthData): Promise<void> {
    return this.state.storage.put('data', data)
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
