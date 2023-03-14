import { AccountURN } from '@proofzero/urns/account'
import { DOProxy } from 'do-proxy'

import { ResponseType } from '@proofzero/types/access'
import type { Scope } from '@proofzero/types/access'

import { CODE_OPTIONS } from '../constants'

import { AuthorizeResult } from '../types'

import {
  MismatchClientIdError,
  MissingAccountNameError,
  MissingClientIdError,
  UnsupportedResponseTypeError,
} from '../errors'

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
    if (responseType != ResponseType.Code)
      throw new UnsupportedResponseTypeError(responseType)

    const timestamp: number = Date.now()

    await this.state.storage.put({
      account,
      clientId,
      redirectUri,
      scope,
      timestamp,
    })

    await this.state.storage.setAlarm(Date.now() + CODE_OPTIONS.ttl)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    clientId: string
  ): Promise<{ code: string }> {
    const account = await this.state.storage.get<AccountURN>('account')
    if (!account) throw MissingAccountNameError

    const storedClientId = await this.state.storage.get<string>('clientId')
    if (!storedClientId) throw MissingClientIdError
    if (clientId != storedClientId) throw MismatchClientIdError

    return { code }
  }

  alarm() {
    this.state.storage.deleteAll()
  }
}
