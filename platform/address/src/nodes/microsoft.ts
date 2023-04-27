import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAddressType } from '@proofzero/types/address'

import { Context } from '../context'
import type { AddressProfile, MicrosoftOAuthProfile } from '../types'

import Address from './address'
import OAuthAddress from './oauth'
import type { AddressNode } from '.'

type MicrosoftAddressProfile = AddressProfile<OAuthAddressType.Microsoft>

const PHOTO_URL = 'https://graph.microsoft.com/v1.0/me/photo/$value'
const USERINFO_URL = 'https://graph.microsoft.com/oidc/userinfo'

export default class MicrosoftAddress extends OAuthAddress {
  declare ctx: Context
  declare clientId: string
  declare clientSecret: string

  constructor(node: AddressNode, ctx: Context) {
    super(node)
    this.ctx = ctx
    this.clientId = ctx.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID
    this.clientSecret = ctx.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET
  }

  async getAvatar() {
    const address = await this.node.class.getAddress()
    const response = await fetch(PHOTO_URL, {
      headers: {
        authorization: await this.getAuthorizationHeader(),
      },
      cf: {
        cacheTtl: 5 * 60,
        cacheEverything: true,
        cacheKey: `avatar-${address}`,
      },
    })

    if (response.ok) {
      let data = ''
      new Uint8Array(await response.arrayBuffer()).forEach(
        (byte) => (data += String.fromCharCode(byte))
      )
      return btoa(data)
    } else {
      console.error(await response.text())
      throw new Error("couldn't fetch photo")
    }
  }

  getRefreshTokenParams(refreshToken: string): URLSearchParams {
    const params = super.getRefreshTokenParams(refreshToken)
    params.set('tenant', 'common')
    return params
  }

  getTokenURL(): string {
    return `https://login.microsoftonline.com/common/oauth2/v2.0/token`
  }

  getUserInfoURL(): string {
    return USERINFO_URL
  }

  async getProfile(): Promise<MicrosoftAddressProfile> {
    const profile = await super.fetchProfile<MicrosoftOAuthProfile>()
    if (profile) {
      return {
        address: profile.email,
        title: profile.name,
        icon: `${this.ctx.PASSPORT_URL}/avatars/${this.ctx.hashedIdref}`,
        type: OAuthAddressType.Microsoft,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Microsoft',
        title: 'Microsoft',
        disconnected: true,
        type: OAuthAddressType.Microsoft,
      }
    }
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAddressProxyStub = DurableObjectStubProxy<OAuthAddress>
