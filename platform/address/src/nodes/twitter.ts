import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { AddressProfile, TwitterOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'

type TwitterAddressProfile = AddressProfile<OAuthAddressType.Twitter>

export default class TwitterAddress extends OAuthAddress {
  async getProfile(): Promise<TwitterAddressProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as TwitterOAuthProfile
    return {
      address: profile.screen_name,
      title: profile.name,
      icon: profile.profile_image_url_https,
      type: OAuthAddressType.Twitter,
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
