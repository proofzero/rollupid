import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import type { AddressProfile, GitHubOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'

type GithubAddressProfile = AddressProfile<OAuthAddressType.GitHub>

const USERINFO_URL = 'https://api.github.com/user'

export default class GithubAddress extends OAuthAddress {
  async getRequestHeaders() {
    return {
      accept: 'application/vnd.github.v3+json',
      authorization: await this.getAuthorizationHeader(),
      'user-agent': 'rollup',
    }
  }

  async getAuthorizationHeader(): Promise<string> {
    const accessToken = await this.getAccessToken()

    if (!accessToken) {
      throw new Error('missing access token')
    }

    return `token ${accessToken}`
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<GithubAddressProfile> {
    const profile = await super.fetchProfile<GitHubOAuthProfile>()
    if (profile) {
      return {
        address: profile.login,
        title: profile.name || profile.login,
        icon: profile.avatar_url,
        type: OAuthAddressType.GitHub,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'GitHub',
        title: 'GitHub',
        disconnected: true,
        type: OAuthAddressType.GitHub,
      }
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'github' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
