import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { Context } from '../context'
import type { OAuthData, OAuthDiscordProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

const TOKEN_URL = 'https://discord.com/api/v10/oauth2/token'

export default class DiscordAddress extends OAuthAddress {
  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.clientId = ctx.INTERNAL_DISCORD_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_DISCORD_OAUTH_CLIENT_SECRET
  }

  async getProfile(): Promise<OAuthDiscordProfile> {
    const data = await this.getData()
    if (!data) throw new Error('no data')

    const profile = data.profile as OAuthData['profile']
    if (profile.provider != OAuthAddressType.Discord) {
      throw new Error('unknown provider')
    }

    return profile.__json
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'discord' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
