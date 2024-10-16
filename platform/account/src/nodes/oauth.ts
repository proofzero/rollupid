import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAccountType } from '@proofzero/types/account'

import { AccountNode } from '.'
import { AccountProfile, OAuthData } from '../types'
import Account from './account'

type RefreshTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  scope?: string
  id_token: string
}

export default class OAuthAccount {
  declare node: AccountNode
  declare clientId: string
  declare clientSecret: string

  constructor(node: AccountNode) {
    this.node = node
  }

  async getData(): Promise<OAuthData | undefined> {
    return this.node.storage.get<OAuthData>('data')
  }

  async setData(data: OAuthData): Promise<void> {
    return this.node.storage.put('data', data)
  }

  async fetchProfile<T>(): Promise<T | undefined> {
    const address = await this.node.class.getAddress()
    try {
      const response = await fetch(this.getUserInfoURL(), {
        cf: {
          cacheTtl: 5 * 60,
          cacheEverything: true,
          cacheKey: `profile-${address}`,
        },
        headers: await this.getRequestHeaders(),
      })
      if (!response.ok) {
        console.warn('Could not fetch upstream profile', await response.text())
        return
      }
      return response.json()
    } catch (err) {
      console.error('Error encountered with fetching profile', err)
    }
  }

  async getProfile(): Promise<AccountProfile<OAuthAccountType>> {
    throw new Error('not implemented')
  }

  async getAccessToken(): Promise<string | undefined> {
    const data = await this.getData()
    if (!data) {
      throw new Error('missing data')
    }

    const { accessToken, timestamp, extraParams } = data

    if (!accessToken) {
      return this.refreshToken()
    }

    if (!extraParams?.expires_in) {
      return accessToken
    }

    if (Date.now() >= timestamp + extraParams?.expires_in * 1000) {
      return this.refreshToken()
    } else {
      return accessToken
    }
  }

  async getRequestHeaders() {
    return {
      authorization: await this.getAuthorizationHeader(),
    }
  }

  async getAuthorizationHeader(): Promise<string> {
    const accessToken = await this.getAccessToken()

    if (!accessToken) {
      throw new Error('missing access token')
    }

    return `Bearer ${accessToken}`
  }

  async refreshToken(): Promise<string | undefined> {
    const data = await this.getData()
    if (!data || !data.refreshToken) {
      throw new Error('missing refresh token')
    }

    try {
      const response = await fetch(this.getTokenURL(), {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: this.getRefreshTokenParams(data.refreshToken).toString(),
      })

      const body = await response.json<RefreshTokenResponse>()
      this.setData({
        ...data,
        timestamp: Date.now(),
        accessToken: body.access_token,
        refreshToken: body.refresh_token ?? data.refreshToken,
        extraParams: {
          ...data.extraParams,
          expires_in: body.expires_in,
          token_type: body.token_type,
          scope: body.scope,
          id_token: body.id_token,
        },
      })

      return body.access_token
    } catch (err) {
      console.error(err)
    }
  }

  getRefreshTokenParams(refreshToken: string): URLSearchParams {
    return new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
  }

  getTokenURL(): string {
    throw new Error('not implemented')
  }

  getUserInfoURL(): string {
    throw new Error('not implemented')
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
