import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { OAuthAccountType } from '@proofzero/types/account'

import type { AccountProfile, TwitterOAuthProfile } from '../types'

import Account from './account'
import OAuthAccount from './oauth'

type TwitterAccountProfile = AccountProfile<OAuthAccountType.Twitter>

export default class TwitterAccount extends OAuthAccount {
  async getProfile(): Promise<TwitterAccountProfile> {
    const data = await this.getData()
    if (!data) throw new InternalServerError({ message: 'no data' })
    const profile = data.profile as TwitterOAuthProfile
    if (profile && profile.username) {
      return {
        address: profile.username,
        title: profile.name,
        icon: profile.picture,
        type: OAuthAccountType.Twitter,
      }
    } else {
      const address = await this.node.class.getAddress()
      return {
        address: address || 'Twitter',
        title: 'Twitter',
        disconnected: true,
        type: OAuthAccountType.Twitter,
      }
    }
  }

  static async alarm(account: Account) {
    console.log({ alarm: 'oauth' })
  }
}

export type OAuthAccountProxyStub = DurableObjectStubProxy<OAuthAccount>
