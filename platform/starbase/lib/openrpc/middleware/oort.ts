/**
 * @file src/middleware/oort.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "@kubelt/openrpc";

import * as openrpc from "@kubelt/openrpc";

// oort
// -----------------------------------------------------------------------------

/**
 * An extension that injects an Oort client into the context.
 */
export default openrpc.middleware(
  async (
    request: Readonly<Request>,
    context: Readonly<RpcContext>,
  ) => {
  // TODO
  return context;
});
