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
@field({
  name: "index",
  doc: "An index from app attributes into app IDs",
  defaultValue: {},
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

  // index_application
  // ---------------------------------------------------------------------------

  @method("index_application")
  @requiredScope("starbase.user")
  @requiredField("apps", [FieldAccess.Read, FieldAccess.Write])
  @requiredField("index", [FieldAccess.Read, FieldAccess.Write])
  appIndex(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    // Unique identifier
    const id = params.get("id")
    console.log(`id = ${id}`)
    const data = params.get("data")
    console.log(`data = ${data}`)
    const fields = params.get("fields")
    console.log(`fields = ${fields}`)

    // Store the application ID.
    if (id !== undefined) {
      const apps = input.get("apps")
      apps.add(id)
      output.set("apps", apps)
    }

    // Index the data by the request fields.

    return Promise.resolve({fixme: true})
  }

  // lookup_application
  // ---------------------------------------------------------------------------

  @method("lookup_application")
  @requiredScope("starbase.user")
  @requiredField("apps", [FieldAccess.Read])
  appLookup(
    params: RpcParams,
    input: RpcInput,
  ): Promise<RpcResult> {
    return Promise.resolve("")
  }

} // END StarbaseUser
