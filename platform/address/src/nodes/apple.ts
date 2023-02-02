import { DurableObjectStubProxy } from 'do-proxy'

import { Context } from '../context'
import { OAuthData, OAuthAppleProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

const TOKEN_URL = 'https://appleid.apple.com/auth/token'

export default class AppleAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_APPLE_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_APPLE_OAUTH_CLIENT_SECRET
  }

  async getProfile(): Promise<OAuthAppleProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    const profile = data.profile as OAuthData['profile']
    const picture = await this.node.class.getGradient()
    return { ...profile, picture } as OAuthAppleProfile
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'apple' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
