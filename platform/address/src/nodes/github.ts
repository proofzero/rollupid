import { DurableObjectStubProxy } from 'do-proxy'

import Address from './address'
import OAuthAddress from './oauth'

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

  static async alarm(address: Address) {
    console.log({ alarm: 'github' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
