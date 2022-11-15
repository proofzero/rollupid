/**
 * @module @kubelt/do.starbase-user
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
  FieldAccess,
  component,
  field,
  method,
  requiredField,
  requiredScope,
  scopes,
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
  "owner",
  "starbase.user",
])
@field({
  name: "apps",
  doc: "A set of user application IDs",
  defaultValue: new Set(),
  /*
  scopes: {
    read: ["starbase.read"],
    write: ["starbase.write"],
  },
  validator: (x) => { return true },
  */
})
export class StarbaseUser {

  // user_name
  // ---------------------------------------------------------------------------

  @method("user_name")
  @requiredScope("starbase.user")
  userName(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    // TODO return updated state
    return Promise.resolve({
      invoked: "user_name",
      context: "StarbaseUser",
    });
  }

  // add_application
  // ---------------------------------------------------------------------------

  @method("add_application")
  @requiredScope("starbase.user")
  @requiredField("apps", [FieldAccess.Read, FieldAccess.Write])
  addApplication(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    const appSet = input.get("apps")
    const appId = params.get("appId")
    // Add the supplied application ID to the list of user's applications.
    if (appId !== undefined) {
      appSet.add(appId)
      output.set("apps", appSet)
    }
    return Promise.resolve(appId);
  }

  // list_applications
  // ---------------------------------------------------------------------------

  @method("list_applications")
  @requiredScope("starbase.user")
  @requiredField("apps", [FieldAccess.Read])
  listApps(
    params: RpcParams,
    input: RpcInput,
  ): Promise<RpcResult> {
    const appSet = input.get("apps")
    const appList = Array.from(appSet)

    return Promise.resolve(appList)
  }

} // END StarbaseUser
