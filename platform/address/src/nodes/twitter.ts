import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { OAuthAddressType } from '@proofzero/types/address'

import type { AddressProfile, TwitterOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'

type TwitterAddressProfile = AddressProfile<OAuthAddressType.Twitter>

export default class TwitterAddress extends OAuthAddress {
  async getProfile(): Promise<TwitterAddressProfile> {
    const data = await this.getData()
    if (!data) throw new InternalServerError({ message: 'no data' })
    const profile = data.profile as TwitterOAuthProfile
    if (profile && profile.username) {
      return {
        address: profile.username,
        title: profile.name,
        icon: profile.picture,
        type: OAuthAddressType.Twitter,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Twitter',
        title: 'Twitter',
        disconnected: true,
        type: OAuthAddressType.Twitter,
      }
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
