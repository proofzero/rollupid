/**
 * @file src/middleware/datadog.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "@kubelt/openrpc";

import * as openrpc from "@kubelt/openrpc";

// datadog
// -----------------------------------------------------------------------------

/**
 * An extension that injects a Datadog client into the context.
 *
 * @todo add constructor function to inject secrets/config and return
 * this fn.
 */
export default openrpc.middleware(
  async (
    request: Readonly<Request>,
    context: Readonly<RpcContext>,
  ) => {
    // TODO
    return context;
  },
);
