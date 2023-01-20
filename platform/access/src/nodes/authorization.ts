import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { AccountURN } from '@kubelt/urns/account'
import { DOProxy } from 'do-proxy'

import { CODE_OPTIONS } from '../constants'

import {
  AuthorizationParameters,
  AuthorizeResult,
  ResponseType,
} from '../types.ts'

export default class Authorization extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async authorize(
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
    const code = hexlify(randomBytes(CODE_OPTIONS.length))
    const codes: Map<string, AuthorizationParameters> =
      (await this.state.storage.get<Map<string, AuthorizationParameters>>(
        'codes'
      )) || new Map()
    codes.set(code, { redirectUri, scope, timestamp })

    await Promise.all([
      this.state.storage.put('account', account),
      this.state.storage.put('clientId', clientId),
      this.state.storage.put('codes', codes),
    ])

    this.state.storage.setAlarm(CODE_OPTIONS.ttl)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<{ code: string }> {
    const account = await this.state.storage.get<AccountURN>('account')
    console.log({ account })
    if (!account) {
      throw new Error('missing account name')
    }

    const storedClientId = await this.state.storage.get<string>('clientId')
    if (!storedClientId) {
      throw new Error('missing client id')
    }

    const codes = await this.state.storage.get<
      Map<string, AuthorizationParameters>
    >('codes')
    if (!codes) {
      throw new Error('missing codes')
    }
    const stored = codes.get(code)
    if (!stored) {
      throw new Error('mismatch code')
    }

    if (redirectUri != stored.redirectUri) {
      throw new Error('mismatch redirect uri')
    }

    if (clientId != storedClientId) {
      throw new Error('mismatch client id')
    }

    codes.delete(code)
    await this.state.storage.put('codes', codes)

    return { code }
  }

  async alarm() {
    const codes = await this.state.storage.get<
      Map<string, AuthorizationParameters>
    >('codes')
    if (!codes) return
    for (const [code, params] of codes) {
      if (params.timestamp + CODE_OPTIONS.ttl * 1000 <= Date.now()) {
        codes.delete(code)
      }
    }
    await this.state.storage.put('codes', codes)
  }
}
