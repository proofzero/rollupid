/**
 * @module @kubelt/do.starbase-contract
 * @file src/index.ts
 */

import * as openrpc from "@kubelt/openrpc";

import type {
  RpcInput,
  RpcOutput,
  RpcParams,
  RpcResult,
} from "@kubelt/openrpc/component";

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
  "owner",
  "starbase.contract",
])
export class StarbaseContract {

  // contract_address
  // ---------------------------------------------------------------------------

  @method("contract_address")
  @requiredScope("starbase.contract")
  contractName(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    // TODO return updated state
    return Promise.resolve({
      invoked: "contract_name",
      context: "StarbaseContract",
    });
  }

} // END StarbaseContract
