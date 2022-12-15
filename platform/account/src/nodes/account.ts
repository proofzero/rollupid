import type {
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from '@kubelt/openrpc/component'

import {
  FieldAccess,
  component,
  field,
  method,
  requiredField,
  scopes,
} from '@kubelt/openrpc/component'

import schema from '../schemas/account'

@component(schema)
@scopes(['owner'])
@field({
  name: 'profile',
  doc: 'Account profile object',
  defaultValue: null,
})
export default class Account {
  @method('getProfile')
  @requiredField('profile', [FieldAccess.Read])
  async getProfile(params: RpcParams, input: RpcInput): Promise<RpcResult> {
    return input.get('profile')
  }

  @method('setProfile')
  @requiredField('profile', [FieldAccess.Write])
  async setProfile(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    return output.set('profile', params.get('profile'))
  }
}
