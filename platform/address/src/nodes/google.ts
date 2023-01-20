import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthData, OAuthGoogleProfile } from '../types'
import Address from './address'
import OAuthAddress from './oauth'

export default class GoogleAddress extends OAuthAddress {
  async getProfile(): Promise<OAuthGoogleProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as OAuthData['profile']
    return profile._json as OAuthGoogleProfile
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'google' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
