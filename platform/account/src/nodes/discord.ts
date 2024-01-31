import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { OAuthAccountType } from '@proofzero/types/account'

import type { Context } from '../context'
import type { AccountProfile, DiscordOAuthProfile } from '../types'

import Account from './account'
import OAuthAccount from './oauth'
import type { AccountNode } from '.'

type DiscordAccountProfile = AccountProfile<OAuthAccountType.Discord>

const TOKEN_URL = 'https://discord.com/api/v10/oauth2/token'
const USERINFO_URL = 'https://discord.com/api/v10/users/@me'

export default class DiscordAccount extends OAuthAccount {
  constructor(node: AccountNode, ctx: Context) {
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

    if (!accessToken)
      throw new InternalServerError({ message: 'missing access token' })

    return `Bearer ${accessToken}`
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<DiscordAccountProfile> {
    const profile = await super.fetchProfile<DiscordOAuthProfile>()
    if (profile) {
      return {
        address: `${profile.username}#${profile.discriminator}`,
        title: profile.username,
        icon: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        type: OAuthAccountType.Discord,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Discord',
        title: 'Discord',
        disconnected: true,
        type: OAuthAccountType.Discord,
      }
    }
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'discord' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
