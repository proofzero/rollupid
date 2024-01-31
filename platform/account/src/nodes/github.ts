import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { OAuthAccountType } from '@proofzero/types/account'

import type { AccountProfile, GitHubOAuthProfile } from '../types'

import Account from './account'
import OAuthAccount from './oauth'

type GithubAccountProfile = AccountProfile<OAuthAccountType.GitHub>

const USERINFO_URL = 'https://api.github.com/user'

export default class GithubAccount extends OAuthAccount {
  async getRequestHeaders() {
    return {
      accept: 'application/vnd.github.v3+json',
      authorization: await this.getAuthorizationHeader(),
      'user-agent': 'rollup',
    }
  }

  async getAuthorizationHeader(): Promise<string> {
    const accessToken = await this.getAccessToken()

    if (!accessToken)
      throw new InternalServerError({ message: 'missing access token' })

    return `token ${accessToken}`
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<GithubAccountProfile> {
    const profile = await super.fetchProfile<GitHubOAuthProfile>()
    if (profile) {
      return {
        address: profile.login,
        title: profile.name || profile.login,
        icon: profile.avatar_url,
        type: OAuthAccountType.GitHub,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'GitHub',
        title: 'GitHub',
        disconnected: true,
        type: OAuthAccountType.GitHub,
      }
    }
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'github' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
