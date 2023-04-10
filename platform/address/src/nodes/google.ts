import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { Context } from '../context'
import { AddressProfile, GoogleOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

type GoogleAddressProfile = AddressProfile<OAuthAddressType.Google>

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export default class GoogleAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_GOOGLE_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_GOOGLE_OAUTH_CLIENT_SECRET
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<GoogleAddressProfile> {
    const profile = await super.fetchProfile<GoogleOAuthProfile>()
    if (!profile) {
      throw new Error('missing profile')
    }
    return {
      address: profile.email,
      title: profile.name,
      icon: profile.picture,
      type: OAuthAddressType.Google,
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'google' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
