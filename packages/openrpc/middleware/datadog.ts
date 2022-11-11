// @kubelt/openrpc:middleware/datadog.ts

/**
 * Provides a middleware that injects a Datadog
 */

import type { RpcContext } from '@kubelt/openrpc'

import * as openrpc from '@kubelt/openrpc'

// datadog
// -----------------------------------------------------------------------------
// TODO add constructor function to inject secrets/config and return this fn.

/**
 * A middleware that injects a Datadog client into the context.
 */
export default openrpc.middleware(
  async (request: Readonly<Request>, context: Readonly<RpcContext>) => {
    // TODO
    return context
  }
)
