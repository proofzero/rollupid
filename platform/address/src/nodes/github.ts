import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@kubelt/types/address'

import { OAuthData, OAuthGithubProfile } from '../types'
import Address from './address'
import OAuthAddress from './oauth'

export default class GithubAddress extends OAuthAddress {
  async getProfile(): Promise<OAuthGithubProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')

    const profile = data.profile as OAuthData['profile']
    if (profile.provider != OAuthAddressType.GitHub) {
      throw new Error('unknown provider')
    }

    return profile._json
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'github' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
