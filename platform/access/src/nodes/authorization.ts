import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import type {
  RpcAlarm,
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  alarm,
  component,
  field,
  method,
  requiredField,
  scopes,
  FieldAccess,
} from '@kubelt/openrpc/component'

import { CODE_OPTIONS } from '../constants'

import schema from '../schemas/authorization'

import {
  AuthorizationParameters,
  AuthorizeResult,
  ResponseType,
} from '../types'

@component(schema)
@field({
  name: 'account',
  doc: 'Account',
  defaultValue: null,
})
@field({
  name: 'clientId',
  doc: 'Client Id',
  defaultValue: null,
})
@field({
  name: 'codes',
  doc: 'Authorization Codes',
  defaultValue: new Map(),
})
@scopes(['owner'])
export default class Authorization {
  @method('authorize')
  @requiredField('account', [FieldAccess.Write])
  @requiredField('clientId', [FieldAccess.Write])
  @requiredField('codes', [FieldAccess.Read, FieldAccess.Write])
  async authorize(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
    alarm: RpcAlarm
  ): Promise<AuthorizeResult> {
    const account = params.get('account')
    const responseType = params.get('responseType')
    const clientId = params.get('clientId')
    const redirectUri = params.get('redirectUri')
    const scope = params.get('scope')
    const state = params.get('state')
    const timestamp = Date.now()

    if (responseType != ResponseType.Code) {
      throw `unsupported response type: ${responseType}`
    }

    const code = hexlify(randomBytes(CODE_OPTIONS.length))
    const codes: Map<string, AuthorizationParameters> =
      input.get('codes') || new Map()
    codes.set(code, { redirectUri, scope, timestamp })

    output.set('account', account)
    output.set('clientId', clientId)
    output.set('codes', codes)

    alarm.after({ seconds: CODE_OPTIONS.ttl })

    return { code, state }
  }

  @method('exchangeToken')
  @requiredField('account', [FieldAccess.Read])
  @requiredField('clientId', [FieldAccess.Read])
  @requiredField('codes', [FieldAccess.Read, FieldAccess.Write])
  exchangeToken(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): RpcResult {
    console.log({ input })
    const account = input.get('account')
    if (!account) {
      throw new Error('missing account name')
    }

    const clientId = input.get('clientId')
    if (!clientId) {
      throw new Error('missing client id')
    }

    const code = params.get('code')
    const codes: Map<string, AuthorizationParameters> = input.get('codes')
    const stored = codes.get(code)
    if (!stored) {
      throw new Error('mismatch code')
    }

    if (params.get('redirectUri') != stored.redirectUri) {
      throw new Error('mismatch redirect uri')
    }

    if (params.get('clientId') != input.get('clientId')) {
      throw new Error('mismatch client id')
    }

    codes.delete(code)
    output.set('codes', codes)

    return code
  }

  @alarm()
  @requiredField('codes', [FieldAccess.Read, FieldAccess.Write])
  expireCodes(input: RpcInput, output: RpcOutput) {
    const codes: Map<string, AuthorizationParameters> = input.get('codes')
    for (const [code, params] of codes) {
      if (params.timestamp + CODE_OPTIONS.ttl * 1000 <= Date.now()) {
        codes.delete(code)
      }
    }
    output.set('codes', codes)
  }
}
