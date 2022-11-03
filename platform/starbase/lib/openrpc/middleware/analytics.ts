/**
 * @file src/middleware/analytics.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "..";

import { middleware } from "..";

// analytics
// -----------------------------------------------------------------------------

/**
 * An extension that injects a Cloudflare Worker Analytics client into the context.
 *
 * @todo add constructor function to inject secrets/config and return this fn.
 */
export default middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO
  return context;
});
