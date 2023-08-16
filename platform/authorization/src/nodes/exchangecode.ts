import { IdentityURN } from '@proofzero/urns/identity'
import { DOProxy } from 'do-proxy'

import { ResponseType } from '@proofzero/types/authorization'
import type { Scope } from '@proofzero/types/authorization'

import { CODE_OPTIONS } from '../constants'

import { AuthorizeResult } from '../types'

import {
  ExpiredCodeError,
  MismatchClientIdError,
  MissingIdentityNameError,
  MissingClientIdError,
  UnsupportedResponseTypeError,
} from '../errors'
import { PersonaData } from '@proofzero/types/application'

export default class ExchangeCode extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async authorize(
    code: string,
    identity: IdentityURN,
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
      identity,
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

    const identity = await this.state.storage.get<IdentityURN>('identity')
    if (!identity) throw MissingIdentityNameError

    const storedClientId = await this.state.storage.get<string>('clientId')
    if (!storedClientId) throw MissingClientIdError
    if (clientId != storedClientId) throw MismatchClientIdError

    return { code }
  }

  alarm() {
    this.state.storage.deleteAll()
  }
}
