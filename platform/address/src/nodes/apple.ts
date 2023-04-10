import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import { Context } from '../context'
import { AddressProfile, AppleOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

type AppleAddressProfile = AddressProfile<OAuthAddressType.Apple>

const TOKEN_URL = 'https://appleid.apple.com/auth/token'

export default class AppleAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_APPLE_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_APPLE_OAUTH_CLIENT_SECRET
  }

  async getProfile(): Promise<AppleAddressProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as AppleOAuthProfile
    const picture = await this.node.class.getGradient()
    return {
      address: profile.email,
      title: profile.name,
      icon: picture,
      type: OAuthAddressType.Apple,
    }
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'apple' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
