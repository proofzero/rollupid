import { AccountURN } from '@kubelt/urns/account'
import { DOProxy } from 'do-proxy'

import { CODE_OPTIONS } from '../constants'

import {
  AuthorizationParameters,
  AuthorizeResult,
  ResponseType,
} from '../types'

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
    scope: any,
    state: string
  ): Promise<AuthorizeResult> {
    if (responseType != ResponseType.Code) {
      throw `unsupported response type: ${responseType}`
    }

    const timestamp: number = Date.now()

    console.log('putting', { account }, this.state.id.toString())

    // await Promise.all([
    await this.state.storage.put('account', account)
    await this.state.storage.put('clientId', clientId)
    await this.state.storage.put('code', { redirectUri, scope, timestamp })
    // ])

    console.log('done')

    await this.state.storage.setAlarm(Date.now() + CODE_OPTIONS.ttl)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<{ code: string }> {
    const account = await this.state.storage.get<AccountURN>('account')
    console.log('getting', { account }, this.state.id.toString())
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

    if (redirectUri != params.redirectUri) {
      throw new Error('mismatch redirect uri')
    }

    if (clientId != storedClientId) {
      throw new Error('mismatch client id')
    }

    return { code }
  }

  async alarm() {
    await this.state.storage.deleteAll() // self-destruct
  }
}
