/**
 * @file src/middleware/authenticate.ts
 */

import * as jose from "jose";

import type {
  RpcContext,
  RpcRequest,
} from "@kubelt/openrpc";

import * as openrpc from "@kubelt/openrpc";

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
export default openrpc.middleware(
  async (
    request: Readonly<Request>,
    context: Readonly<RpcContext>,
  ) => {
    // TODO
    return context;
  },
);
