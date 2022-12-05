import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { DurableObject } from '@kubelt/platform.commons'

import type { AccountURN } from '@kubelt/urns/account'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import { CODE_OPTIONS } from './constants'

import {
  AccessApi,
  AuthorizationApi as Api,
  AuthorizationParameters,
  AuthorizeResult,
  Environment,
  ExchangeTokenResult,
  ResponseType,
  Scope,
} from './types'

export default class Authorization extends DurableObject<Environment, Api> {
  methods(): Api {
    return {
      params: this.params.bind(this),
      authorize: this.authorize.bind(this),
      exchangeToken: this.exchangeToken.bind(this),
    }
  }

  async alarm() {
    console.log(`cleaning up the codes for ${this.id}`)
    this.storage.list({ prefix: 'codes/' }).then((keys) => {
      console.log('keys', keys)
      keys.forEach((_, key) => {
        this.storage.delete(key)
      })
    })
  }

  async params(code: string): Promise<AuthorizationParameters> {
    const params = await this.storage.get<AuthorizationParameters>(
      `codes/${code}`
    )
    if (!params) {
      throw 'missing authorization parameters: ${code}'
    }
    return params
  }

  async authorize(
    account: AccountURN,
    responseType: ResponseType,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult> {
    if (responseType != ResponseType.Code) {
      throw `unsupported response type: ${responseType}`
    }

    const code = hexlify(randomBytes(CODE_OPTIONS.length))
    await this.storage.put({
      account,
      clientId,
      [`codes/${code}`]: { redirectUri, scope },
    })

    this.storage.setAlarm(Date.now() + 2 * 60 * 1000)

    return { code, state }
  }

  async exchangeToken(
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<ExchangeTokenResult> {
    const { Access } = this.env

    const account = await this.storage.get<string>('account')

    if (!account) {
      throw 'missing account name'
    }

    const params = await this.params(code)
    if (redirectUri != params.redirectUri) {
      console.error(
        `authorization: invalid redirect URI, expected ${params.redirectUri}, got ${redirectUri}`
      )
      throw 'invalid redirect URI'
    }

    await this.storage.delete(`codes/${code}`)

    const { scope } = params
    const access = Access.get(Access.newUniqueId())
    const client = createFetcherJsonRpcClient<AccessApi>(access)
    return client.generate(account, clientId, scope)
  }
}
