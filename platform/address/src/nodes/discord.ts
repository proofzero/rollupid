import { DurableObjectStubProxy } from 'do-proxy'

import type { Context } from '../context'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

const TOKEN_URL = 'https://discord.com/api/v10/oauth2/token'
const USERINFO_URL = 'https://discord.com/api/v10/users/@me'

export default class DiscordAddress extends OAuthAddress {
  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_DISCORD_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_DISCORD_OAUTH_CLIENT_SECRET
  }

  async getRequestHeaders() {
    return {
      authorization: await this.getAuthorizationHeader(),
      'user-agent': 'rollup',
    }
  }

  async getAuthorizationHeader(): Promise<string> {
    const accessToken = await this.getAccessToken()

    if (!accessToken) {
      throw new Error('missing access token')
    }

    return `Bearer ${accessToken}`
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'discord' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
