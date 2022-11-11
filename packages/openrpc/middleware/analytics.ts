// @kubelt/openrpc:middleware/analytics.ts

/**
 * Provides a middleware that injects a Cloudflare Worker Analytics
 * client into the context.
 */

import type { RpcContext } from '@kubelt/openrpc'

import * as openrpc from '@kubelt/openrpc'

// analytics
// -----------------------------------------------------------------------------
//TODO add constructor function to inject secrets/config and return this fn.

/**
 * An extension that injects a Cloudflare Worker Analytics client into
 * the context.
 */
export default openrpc.middleware(
  async (request: Readonly<Request>, context: Readonly<RpcContext>) => {
    // TODO
    return context
  }
)
