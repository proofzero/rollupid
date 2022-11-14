import _ from 'lodash'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { DurableObject } from '../../commons/src'

import { createFetcherJsonRpcClient } from '../../commons/src/jsonrpc'

import { CODE_OPTIONS } from './constants'

import {
  AccessApi,
  AuthorizationApi as Api,
  AuthorizationRequest,
  AuthorizeResult,
  Environment,
  ExchangeCodeResult,
  Scope,
} from './types'

export default class Authorization extends DurableObject<Environment, Api> {
  methods(): Api {
    return {
      authorize: this.authorize.bind(this),
      exchangeCode: this.exchangeCode.bind(this),
    }
  }

  async authorize(
    coreId: string,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult> {
    const authorized = (await this.storage.get<Scope>('scope')) || []
    const diff = _.difference(scope, authorized)
    const isAuthorized = diff.length == 0
    const code = hexlify(randomBytes(CODE_OPTIONS.length))
    await this.storage.put({
      coreId,
      clientId,
      [`codes/${code}`]: { redirectUri, scope, state },
    })

    return { code, state, diff, isAuthorized }
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeCodeResult> {
    const { Access } = this.env

    const coreId = await this.storage.get<string>('coreId')
    if (!coreId) {
      throw 'missing core identifier'
    }

    const request = await this.storage.get<AuthorizationRequest>(
      `codes/${code}`
    )
    if (!request) {
      throw 'missing authorization request'
    }

    if (redirectUri != request.redirectUri) {
      throw 'invalid redirect URI'
    }

    await this.storage.delete(`codes/${code}`)

    // TODO: check client secret somehow

    const { scope } = request
    const access = Access.get(Access.newUniqueId())
    const client = createFetcherJsonRpcClient<AccessApi>(access)
    return client.generate(coreId, clientId, scope)
  }
}
