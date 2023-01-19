import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthData, OAuthTwitterProfile } from '../types'
import Address from './address'
import OAuthAddress from './oauth'

export default class TwitterAddress extends OAuthAddress {
  async getProfile(): Promise<OAuthTwitterProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as OAuthData['profile']
    return profile as OAuthTwitterProfile
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
