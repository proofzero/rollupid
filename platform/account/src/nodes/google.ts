import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAccountType } from '@proofzero/types/account'
import type { Environment } from '@proofzero/platform.core'

import { AccountProfile, GoogleOAuthProfile } from '../types'

import Account from './account'
import OAuthAccount from './oauth'
import type { AccountNode } from '.'

type GoogleAccountProfile = AccountProfile<OAuthAccountType.Google>

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export default class GoogleAccount extends OAuthAccount {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AccountNode, env: Environment) {
    super(node)
    this.clientId = env.INTERNAL_GOOGLE_OAUTH_CLIENT_ID
    this.clientSecret = env.SECRET_GOOGLE_OAUTH_CLIENT_SECRET
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<GoogleAccountProfile> {
    const profile = await super.fetchProfile<GoogleOAuthProfile>()
    if (profile) {
      return {
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        type: OAuthAccountType.Google,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Google',
        title: 'Google',
        disconnected: true,
        type: OAuthAccountType.Google,
      }
    }
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'google' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
