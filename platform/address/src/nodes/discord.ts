import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { Context } from '../context'
import type { AddressProfile, DiscordOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

type DiscordAddressProfile = AddressProfile<OAuthAddressType.Discord>

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

  async getProfile(): Promise<DiscordAddressProfile> {
    const profile = await super.fetchProfile<DiscordOAuthProfile>()
    if (!profile) {
      throw new Error('missing profile')
    }
    return {
      address: `${profile.username}#${profile.discriminator}`,
      title: profile.username,
      icon: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      type: OAuthAddressType.Discord,
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'discord' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
