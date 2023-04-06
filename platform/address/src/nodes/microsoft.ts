import { DurableObjectStubProxy } from 'do-proxy'

import { Context } from '../context'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

const USERINFO_URL = 'https://graph.microsoft.com/oidc/userinfo'

export default class MicrosoftAddress extends OAuthAddress {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET
  }

  getRefreshTokenParams(refreshToken: string): URLSearchParams {
    const params = super.getRefreshTokenParams(refreshToken)
    params.set('tenant', 'common')
    return params
  }

  getTokenURL(): string {
    return `https://login.microsoftonline.com/common/oauth2/v2.0/token`
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
