import { DurableObjectStubProxy } from 'do-proxy'

import { Context } from '../context'
import { OAuthData, OAuthMicrosoftProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'
import { OAuthAddressType } from '@kubelt/types/address'

export default class MicrosoftAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string
  declare tenantId: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET
    this.tenantId = ctx.INTERNAL_MICROSOFT_OAUTH_TENANT_ID
  }

  async getProfile(): Promise<OAuthMicrosoftProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')
    if (data.profile.provider === OAuthAddressType.Microsoft) {
      const profile = data.profile
      let picture
      if (profile._json) {
        if (!profile._json?.name) {
          profile._json.name =
            profile.displayName ||
            profile.name?.givenName ||
            profile._json.email ||
            profile._json.sub
        }
        const gradient = this.node.class.getGradient()
        picture = profile._json.rollupidImageUrl || gradient
      }
      return {
        ...profile._json,
        picture,
      } as OAuthMicrosoftProfile
    } else {
      throw new Error("Specified provider isn't set to Microsoft")
    }
  }
  getRefreshTokenParams(refreshToken: string): URLSearchParams {
    const params = super.getRefreshTokenParams(refreshToken)
    params.set('tenant', this.tenantId)
    return params
  }

  getTokenURL(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
