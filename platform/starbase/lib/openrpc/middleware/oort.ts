/**
 * @file src/middleware/oort.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "..";

import { middleware } from "..";

// oort
// -----------------------------------------------------------------------------

/**
 * An extension that injects an Oort client into the context.
 */
export default middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO
  return context;
});
