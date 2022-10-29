import { get, set } from 'lodash'
import { Methods } from '@open-rpc/meta-schema'

import { Context } from '../../types'
import JSONRPC, { MethodMap } from '../../jsonrpc'

import methodObjects from './methods'
import { GetParams, GetResult, SetParams, SetResult } from './types'

export default class Storage extends JSONRPC {
  getMethodMap(): MethodMap {
    return super.getMethodMap({
      kb_getData: 'getData',
      kb_setData: 'setData',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async getNamespace(namespace: string): Promise<object> {
    return this.core.storage.get<object>(`storage.${namespace}`)
  }

  async getData(params: GetParams, context: Context): Promise<GetResult> {
    const [namespace, path] = params
    this.checkClaim(context, namespace, 'read')
    const current = await this.getNamespace(namespace)
    const value = get(current || {}, path) || null
    return { namespace, path, value }
  }

  async setData(params: SetParams, context: Context): Promise<SetResult> {
    const [namespace, path, value] = params
    this.checkClaim(context, namespace, 'write')
    const current = await this.core.storage.get<object>(`storage.${namespace}`)
    const next = set(current || {}, path, value)
    await this.core.storage.put(`storage.${namespace}`, next)
    return { namespace, path, value }
  }

  checkClaim(context: Context, namespace: string, operation: string): void {
    const claim = get(context, `claims.capabilities.${namespace}.${operation}`)
    if (claim != true) {
      this.error(null, 'cannot authorize')
    }
  }
}
