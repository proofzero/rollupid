/**
 * @file src/middleware/datadog.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "..";

import { middleware } from "..";

// datadog
// -----------------------------------------------------------------------------

/**
 * An extension that injects a Datadog client into the context.
 *
 * @todo add constructor function to inject secrets/config and return
 * this fn.
 */
export default middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO
  return context;
});
