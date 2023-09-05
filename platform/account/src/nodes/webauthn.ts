import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { WebauthnAccountType } from '@proofzero/types/account'

import { AccountProfile } from '../types'

import { AccountNode } from '.'
import { Context } from '../context'

type WebauthnAccountProfile = AccountProfile<WebauthnAccountType.WebAuthN>
type WebAuthNData = any

export default class WebauthnAccount {
  declare node: AccountNode
  declare ctx: Context

  async getData(): Promise<WebAuthNData | undefined> {
    return this.node.storage.get<WebAuthNData>('data')
  }

  async setData(data: WebAuthNData): Promise<void> {
    return this.node.storage.put('data', data)
  }

  constructor(node: AccountNode, ctx: Context) {
    this.node = node
    this.ctx = ctx
  }

  async getProfile(): Promise<WebauthnAccountProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])
    if (!address)
      throw new InternalServerError({
        message: 'Cannot load profile for webauthn account node',
        cause: 'missing account',
      })
    return {
      address,
      title: nickname ?? address,
      icon: gradient,
      type: WebauthnAccountType.WebAuthN,
    }
  }
}
export type WebAuthNAccountProxyStub = DurableObjectStubProxy<WebauthnAccount>
