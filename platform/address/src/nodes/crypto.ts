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

import { AccountURNSpace } from '@kubelt/urns/account'

import schema from '../schemas/crypto'

import { ACCOUNT_OPTIONS, NONCE_OPTIONS } from '../constants'
import type { Challenge } from '../types'
import { recoverEthereumAddress } from '../utils'

@component(schema)
@scopes(['owner'])
@field({
  name: 'address',
  doc: 'Address',
  defaultValue: null,
})
@field({
  name: 'type',
  doc: 'Type',
  defaultValue: null,
})
@field({
  name: 'account',
  doc: 'Account URN',
  defaultValue: null,
})
@field({
  name: 'challenges',
  doc: 'Challenges',
  defaultValue: new Map(),
})
@field({
  name: 'profile',
  doc: 'Address Profile',
  defaultValue: null,
})
@field({
  name: 'pfpVoucher',
  doc: 'PFP Voucher',
  defaultValue: null,
})
@field({
  name: 'webhook_registered',
  doc: 'Webhook registered flag',
  defaultValue: false,
})
@field({
  name: 'indexed_tokens',
  doc: 'Indexed tokens flag',
  defaultValue: false,
})
export default class CryptoAddress {
  @method('getAddress')
  @requiredField('address', [FieldAccess.Read])
  getAddress(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('address')
  }

  @method('setAddress')
  @requiredField('address', [FieldAccess.Write])
  setAddress(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return output.set('address', params.get('address'))
  }

  @method('getType')
  @requiredField('type', [FieldAccess.Read])
  getType(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('type')
  }

  @method('setType')
  @requiredField('type', [FieldAccess.Write])
  setType(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return output.set('type', params.get('type'))
  }

  @method('registerWebhook')
  @requiredField('webhook_registered', [FieldAccess.Write])
  registerWebhook(params: RpcParams, output: RpcOutput): RpcResult {
    return output.set('webhook_registered', true)
  }

  @method('isWebhookRegistered')
  @requiredField('webhook_registered', [FieldAccess.Read])
  isWebhookRegistered(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('webhook_registered')
  }

  @method('indexedTokens')
  @requiredField('indexed_tokens', [FieldAccess.Write])
  indexedTokens(params: RpcParams, output: RpcOutput): RpcResult {
    return output.set('indexed_tokens', true)
  }

  @method('isTokensIndexed')
  @requiredField('indexed_tokens', [FieldAccess.Read])
  isTokensIndexed(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('indexed_tokens')
  }

  @method('resolveAccount')
  @requiredField('account', [FieldAccess.Read, FieldAccess.Write])
  resolveAccount(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): RpcResult {
    const stored = input.get('account')
    if (stored) {
      if (AccountURNSpace.is(stored)) {
        return stored
      } else {
        const urn = AccountURNSpace.urn(stored)
        output.set('account', urn)
        return urn
      }
    } else {
      const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
      const urn = AccountURNSpace.urn(name)
      output.set('account', urn)
      return urn
    }
  }

  @method('getAccount')
  @requiredField('account', [FieldAccess.Read])
  getAccount(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('account')
  }

  @method('setAccount')
  @requiredField('account', [FieldAccess.Write])
  setAccount(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return output.set('account', params.get('account'))
  }

  @method('unsetAccount')
  @requiredField('account', [FieldAccess.Write])
  unsetAccount(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): RpcResult {
    return output.set('account', null)
  }

  @method('getNonce')
  @requiredField('challenges', [FieldAccess.Read, FieldAccess.Write])
  getNonce(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
    alarm: RpcAlarm
  ): RpcResult {
    const nonce = hexlify(randomBytes(NONCE_OPTIONS.length))
    const address = params.get('address')
    const template = params.get('template')
    const redirectUri = params.get('redirectUri')
    const scope = params.get('scope')
    const state = params.get('state')
    const timestamp = Date.now()

    const challenges: Map<string, Challenge> = input.get('challenges')
    challenges.set(nonce, {
      address,
      template,
      redirectUri,
      scope,
      state,
      timestamp,
    })
    output.set('challenges', challenges)

    alarm.after({ seconds: NONCE_OPTIONS.ttl })

    return nonce
  }

  @method('verifyNonce')
  @requiredField('challenges', [FieldAccess.Read, FieldAccess.Write])
  verifyNonce(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): RpcResult {
    const nonce = params.get('nonce')
    const signature = params.get('signature')
    const challenges: Map<string, Challenge> = input.get('challenges')
    const challenge = challenges.get(nonce)

    if (!challenge) {
      throw new Error('not matching nonce')
    }

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const address = recoverEthereumAddress(message, signature)

    if (address != challenge.address) {
      throw new Error('not matching address')
    }

    challenges.delete(nonce)
    output.set('challenges', challenges)

    return challenge
  }

  @method('getProfile')
  @requiredField('profile', [FieldAccess.Read])
  getProfile(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('profile')
  }

  @method('setProfile')
  @requiredField('profile', [FieldAccess.Read, FieldAccess.Write])
  setProfile(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    const profile = input.get('profile') || {}
    Object.assign(profile, params.get('profile'))
    return output.set('profile', profile)
  }

  @method('getPfpVoucher')
  @requiredField('pfpVoucher', [FieldAccess.Read])
  getPfpVoucher(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('pfpVoucher')
  }

  @method('setPfpVoucher')
  @requiredField('pfpVoucher', [FieldAccess.Write])
  setPfpVoucher(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): RpcResult {
    return output.set('pfpVoucher', params.get('voucher'))
  }

  @alarm()
  @requiredField('challenges', [FieldAccess.Read, FieldAccess.Write])
  expireNonces(input: RpcInput, output: RpcOutput) {
    const challenges: Map<string, Challenge> = input.get('challenges')
    for (const [nonce, challenge] of challenges) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl * 1000 <= Date.now()) {
        challenges.delete(nonce)
      }
    }
    output.set('challenges', challenges)
  }
}
