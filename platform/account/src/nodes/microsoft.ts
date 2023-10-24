import { DurableObjectStubProxy } from 'do-proxy'

import { OAuthAccountType } from '@proofzero/types/account'
import type { Environment } from '@proofzero/platform.core'

import type {
  AccountProfile,
  MicrosoftOAuthProfile,
  MicrosoftOAuthProfilePersonal,
  MicrosoftOAuthProfileWork,
} from '../types'

import Account from './account'
import OAuthAccount from './oauth'
import type { AccountNode } from '.'

type MicrosoftAccountProfile = AccountProfile<OAuthAccountType.Microsoft>

const PHOTO_URL = 'https://graph.microsoft.com/v1.0/me/photo/$value'
const USERINFO_URL = 'https://graph.microsoft.com/oidc/userinfo'

export default class MicrosoftAccount extends OAuthAccount {
  declare env: Environment
  declare clientId: string
  declare clientSecret: string
  declare hashedIdRef: string

  constructor(node: AccountNode, hashedIdRef: string, env: Environment) {
    super(node)
    this.env = env
    this.clientId = env.INTERNAL_MICROSOFT_OAUTH_CLIENT_ID
    this.clientSecret = env.SECRET_MICROSOFT_OAUTH_CLIENT_SECRET
    this.hashedIdRef = hashedIdRef
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

      const gradientUrl = await this.node.class.getGradient()
      if (!gradientUrl) return ''
      const gradient = await fetch(gradientUrl)
      let data = ''
      new Uint8Array(await gradient.arrayBuffer()).forEach(
        (byte) => (data += String.fromCharCode(byte))
      )
      return btoa(data)
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

  async getProfile(): Promise<MicrosoftAccountProfile> {
    const profile = await super.fetchProfile<MicrosoftOAuthProfile>()
    if (profile) {
      let name = 'Microsoft'
      if (isPersonalProfile(profile)) {
        name = `${profile.givenname} ${profile.familyname}`
      } else if (isWorkProfile(profile)) {
        name = profile.name || `${profile.given_name} ${profile.family_name}`
      }
      return {
        address: profile.email,
        title: name,
        icon: `${this.env.PASSPORT_URL}/avatars/${this.hashedIdRef}`,
        type: OAuthAccountType.Microsoft,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Microsoft',
        title: 'Microsoft',
        disconnected: true,
        type: OAuthAccountType.Microsoft,
      }
    }
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'oauth' })
  }
}

const isPersonalProfile = (
  profile: MicrosoftOAuthProfile
): profile is MicrosoftOAuthProfilePersonal => {
  return 'givenname' in profile
}

const isWorkProfile = (
  profile: MicrosoftOAuthProfile
): profile is MicrosoftOAuthProfileWork => {
  return 'name' in profile || 'given_name' in profile
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
