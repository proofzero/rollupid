import { AccountURN } from '@proofzero/urns/account'
import { DOProxy } from 'do-proxy'

import { ResponseType } from '@proofzero/types/access'
import type { Scope } from '@proofzero/types/access'

import { CODE_OPTIONS } from '../constants'

import { AuthorizeResult } from '../types'

import {
  ExpiredCodeError,
  MismatchClientIdError,
  MissingAccountNameError,
  MissingClientIdError,
  UnsupportedResponseTypeError,
} from '../errors'
import { PersonaData } from '@proofzero/types/application'

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
    state: string,
    personaData?: PersonaData
  ): Promise<AuthorizeResult> {
    if (responseType != ResponseType.Code)
      throw new UnsupportedResponseTypeError(responseType)

    const timestamp: number = Date.now()

    await this.state.storage.put({
      account,
      clientId,
      redirectUri,
      scope,
      personaData,
      timestamp,
    })

    await this.state.storage.setAlarm(Date.now() + CODE_OPTIONS.ttl)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    clientId: string
  ): Promise<{ code: string }> {
    //Since timestamp is computer-generated, if it doesn't exist
    //it means the code was deleted by an expiry alarm
    const timestamp = await this.state.storage.get<number>('timestamp')
    if (!timestamp) throw ExpiredCodeError

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
