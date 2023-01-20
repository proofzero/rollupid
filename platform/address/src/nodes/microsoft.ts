import { DurableObjectStubProxy } from 'do-proxy'
import { OAuthData, OAuthMicrosoftProfile } from '../types.ts'
import Address from './address'
import OAuthAddress from './oauth'

export default class MicrosoftAddress extends OAuthAddress {
  async getProfile(): Promise<OAuthMicrosoftProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as OAuthData['profile']
    const gradient = this.node.class.getGradient()
    return { picture: gradient, ...profile._json } as OAuthMicrosoftProfile
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
