import { DurableObjectStubProxy } from 'do-proxy'

import { Context } from '../context'
import { OAuthData, OAuthMicrosoftProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

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
    const profile = data.profile as OAuthData['profile']
    const gradient = this.node.class.getGradient()
    return { picture: gradient, ...profile._json } as OAuthMicrosoftProfile
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
