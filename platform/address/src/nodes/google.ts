import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { Context } from '../context'
import { OAuthData, OAuthGoogleProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

export default class GoogleAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_GOOGLE_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_GOOGLE_OAUTH_CLIENT_SECRET
  }

  async getProfile(): Promise<OAuthGoogleProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')

    const profile = data.profile as OAuthData['profile']
    if (profile.provider != OAuthAddressType.Google) {
      throw new Error('unknown provider')
    }

    return profile._json
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'google' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
