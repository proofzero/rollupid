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

import schema from '../schemas/meta'
import { Visibility } from '../types'

@component(schema)
@scopes(['owner'])
@field({
  name: 'version',
  doc: 'Version',
  defaultValue: 0,
})
@field({
  name: 'visibility',
  doc: 'Visibility',
  defaultValue: Visibility.PUBLIC,
})
export default class Meta {
  @method('get')
  @requiredField('version', [FieldAccess.Read])
  @requiredField('visibility', [FieldAccess.Read])
  async get(params: RpcParams, input: RpcInput): Promise<RpcResult> {
    return {
      version: input.get('version') || 0,
      visibility: input.get('visibility') || Visibility.PUBLIC,
    }
  }

  @method('set')
  @requiredField('version', [FieldAccess.Write])
  @requiredField('visibility', [FieldAccess.Write])
  async setProfile(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput
  ): Promise<RpcResult> {
    output.set('version', params.get('version'))
    output.set('visibility', params.get('visibility'))
    return output
  }
}
