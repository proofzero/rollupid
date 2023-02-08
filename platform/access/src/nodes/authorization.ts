import { AccountURN } from '@kubelt/urns/account'
import { DOProxy } from 'do-proxy'

import { ResponseType } from '@kubelt/types/access'
import type { Scope } from '@kubelt/types/access'

import { CODE_OPTIONS } from '../constants'

import { AuthorizationParameters, AuthorizeResult } from '../types'

export default class Authorization extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async authorize(
    code: string,
    account: AccountURN,
    responseType: string,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult> {
    if (responseType != ResponseType.Code) {
      throw `unsupported response type: ${responseType}`
    }

    const timestamp: number = Date.now()

    await this.state.storage.put({
      account,
      clientId,
      code: { redirectUri, scope, timestamp },
    })

    await this.state.storage.setAlarm(Date.now() + CODE_OPTIONS.ttl)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    clientId: string
  ): Promise<{ code: string }> {
    const account = await this.state.storage.get<AccountURN>('account')
    if (!account) {
      throw new Error('missing account name')
    }

    const storedClientId = await this.state.storage.get<string>('clientId')
    if (!storedClientId) {
      throw new Error('missing client id')
    }

    const params = await this.state.storage.get<AuthorizationParameters>('code')
    if (!params) {
      throw new Error('missing code params')
    }

    if (clientId != storedClientId) {
      throw new Error('mismatch client id')
    }

    return { code }
  }

  async getScope(): Promise<string[] | undefined> {
    return await this.state.storage.get<string[]>('scope')
  }

  async alarm() {
    await this.state.storage.deleteAll() // self-destruct
  }
}
