/**
 * @file src/middleware.ts
 *
 * Middleware handlers take a request and a context object accumulated
 * up to the current point, and return an updated context
 * object. Requests are read-only, so this provides an opportunity to
 * provide context information to the RPC request handlers that perform
 * the work of the service.
 */

// TODO implement guards for middleware that assert what data they expect to be in the context

// TODO support namespacing in middleware; set reverse-TLD namespace into which context values will be set

// TODO update the middleware() function to accept a reverse-TLD
// namespace that is used to constrain what values are injected into the
// context.

import * as _ from "lodash";

import type {
  RpcContext,
  RpcRequest,
} from "@kubelt/openrpc";

import * as openrpc from "@kubelt/openrpc";

// example
// -----------------------------------------------------------------------------

/**
 * An example extension.
 */
export const example = openrpc.middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO
  return context;
});
