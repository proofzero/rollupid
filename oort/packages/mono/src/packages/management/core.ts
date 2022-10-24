import { Methods } from '@open-rpc/meta-schema'

import { Context } from '../../types'
import JSONRPC, { MethodMap } from '../../jsonrpc'

import methodObjects from './methods'

import {
  GetAddressesParams,
  GetAddressesResult,
  GetClaimsParams,
  GetClaimsResult,
} from './types'

export default class Core extends JSONRPC {
  getMethodMap(): MethodMap {
    return super.getMethodMap({
      kb_getCoreClaims: 'getClaims',
      kb_getCoreAddresses: 'getAddresses',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async getClaims(
    params: GetClaimsParams,
    context: Context
  ): Promise<GetClaimsResult> {
    await this.authorize(context)
    const subject = context.claims.sub
    return this.core.getClaims(subject)
  }

  async getAddresses(
    params: GetAddressesParams,
    context: Context
  ): Promise<GetAddressesResult> {
    await this.authorize(context)
    const [types] = params
    return this.core.getAddresses(types)
  }
}
