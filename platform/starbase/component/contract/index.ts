/**
 * @module @kubelt/do.starbase-contract
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

// StarbaseContract
// -----------------------------------------------------------------------------

/**
 * Stores state that describes a Starbase smart contract.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
@component(schema)
@scopes([
  "starbase.contract",
])
export class StarbaseContract {

  // contract_address
  // ---------------------------------------------------------------------------

  @method("contract_address")
  @requiredScope("starbase.contract")
  contractName(
    request: RpcRequest,
    state: Map<string, any>,
    context: Map<string, any>,
    remote: Map<string, any>,
  ): Promise<RpcResponse> {
    // TODO return updated state
    return openrpc.response(request, {
      invoked: "contract_name",
      context: "StarbaseContract",
    });
  }

} // END StarbaseContract
