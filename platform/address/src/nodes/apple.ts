import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthData, OAuthAppleProfile } from '../types'
import Address from './address'
import OAuthAddress from './oauth'

export default class AppleAddress extends OAuthAddress {
  async getProfile(): Promise<OAuthAppleProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as OAuthData['profile']
    return profile as OAuthAppleProfile
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'apple' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
