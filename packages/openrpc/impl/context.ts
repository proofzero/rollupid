// @kubelt/openrpc:impl/context.ts

/**
 * An RpcContext
 */

import * as _ from 'lodash'

// RpcContext
// -----------------------------------------------------------------------------

/**
 * Extra context to make available while processing a request.
 *
 * @privateRemarks
 *
 * We specialize Map to use `_.set()` and `_.get()` for setting and
 * retrieving values as these methods do a good job of handling
 * path-like keys.
 *
 * @example
 * The key `com.kubelt.geo/location` gets mapped into:
 * ```
 * {
 *   com: {
 *     kubelt: {
 *       "geo/location": {
 *         ...
 *       }
 *     }
 *   }
 * }
 * ```
 */
export class RpcContext extends Map<string | symbol, any> {
  get(k: string | symbol): any {
    if (typeof(k) === 'symbol') {
      k = k.toString()
    }
    return _.get(this, k)
  }
  set(k: string | symbol, v: any): this {
    if (typeof(k) === 'symbol') {
      k = k.toString()
    }
    _.set(this, k, v)
    return this
  }
}
