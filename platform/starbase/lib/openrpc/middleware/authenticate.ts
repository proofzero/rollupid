/**
 * @file src/middleware/authenticate.ts
 */

import type {
  RpcContext,
  RpcRequest,
} from "..";

import { middleware } from "..";

// TODO import jose

// authenticate
// -----------------------------------------------------------------------------

/**
 * An extension that validates a JWT in the request to ensure that the
 * request has the requisite permission(s) for the operation they're
 * trying to perform.
 *
 * @return a HTTP 401 error if the JWT is invalid, otherwise returns the
 * context updated with the set of claims contained within the JWT.
 */
export default middleware(async (request: RpcRequest, context: RpcContext) => {
  // TODO
  return context;
});
