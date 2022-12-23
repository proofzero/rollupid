import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import type {
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  component,
  field,
  method,
  requiredField,
  scopes,
  FieldAccess,
} from '@kubelt/openrpc/component'

import { AccountURNSpace } from '@kubelt/urns/account'

import schema from '../schemas/oauth'

import { ACCOUNT_OPTIONS } from '../constants'

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
  name: 'data',
  doc: 'Data',
  defaultValue: null,
})
@field({
  name: 'profile',
  doc: 'Address Profile',
  defaultValue: null,
})
export default class OAuthAddress {
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

  @method('getData')
  @requiredField('data', [FieldAccess.Read])
  getData(params: RpcParams, input: RpcInput): RpcResult {
    return input.get('data')
  }

  @method('setData')
  @requiredField('data', [FieldAccess.Write])
  setData(params: RpcParams, input: RpcInput, output: RpcOutput): RpcResult {
    return output.set('data', params.get('data'))
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
}
