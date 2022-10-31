/**
 * @module @kubelt/do.starbase-user
 * @file src/index.ts
 */

import type {
  RpcRequest,
  RpcResponse,
} from "@kubelt/openrpc";

import * as openrpc from "@kubelt/openrpc";

import {
  component,
  scopes,
  method,
  requiredScope,
} from "@kubelt/openrpc/component";

// The OpenRPC schema that defines the RPC API provided by the Durable Object.
import schema from "./schema";

// StarbaseUser
// -----------------------------------------------------------------------------

/**
 * Stores state that describes a Starbase user.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
@component(schema)
@scopes([
  "starbase.user",
])
export class StarbaseUser {

  // user_name
  // ---------------------------------------------------------------------------

  @method("user_name")
  @requiredScope("starbase.user")
  userName(
    request: RpcRequest,
    state: Map<string, any>,
    context: Map<string, any>,
    remote: Map<string, any>,
  ): Promise<RpcResponse> {
    // TODO return updated state
    return openrpc.response(request, {
      invoked: "user_name",
      context: "StarbaseUser",
    });
  }

} // END StarbaseUser
