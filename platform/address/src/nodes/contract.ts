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

import schema from '../schemas/contract'

@component(schema)
@scopes([])
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
  name: 'profile',
  doc: 'Address Profile',
  defaultValue: null,
})
export default class ContractAddress {
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
