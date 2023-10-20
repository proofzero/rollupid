import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { OAuthAccountType } from '@proofzero/types/account'
import type { Environment } from '@proofzero/platform.core'

import { AccountProfile, AppleOAuthProfile } from '../types'

import Account from './account'
import OAuthAccount from './oauth'
import type { AccountNode } from '.'

type AppleAccountProfile = AccountProfile<OAuthAccountType.Apple>

const TOKEN_URL = 'https://appleid.apple.com/auth/token'

export default class AppleAccount extends OAuthAccount {
  declare clientId: string
  declare clientSecret: string

  constructor(node: AccountNode, env: Environment) {
    super(node)
    this.clientId = env.INTERNAL_APPLE_OAUTH_CLIENT_ID
    this.clientSecret = env.SECRET_APPLE_OAUTH_CLIENT_SECRET
  }

  async getProfile(): Promise<AppleAccountProfile> {
    const data = await this.getData()
    if (!data) throw new InternalServerError({ message: 'no data' })
    const profile = data.profile as AppleOAuthProfile
    const picture = await this.node.class.getGradient()
    return {
      address: profile.email,
      title: profile.name,
      icon: picture,
      type: OAuthAccountType.Apple,
    }
  }

  getTokenURL(): string {
    return TOKEN_URL
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'apple' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
