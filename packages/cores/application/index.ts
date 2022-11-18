/**
 * @module @kubelt/do.starbase
 * @file src/index.ts
 */

import * as _ from "lodash";

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

// StarbaseApplication
// -----------------------------------------------------------------------------
// A Durable Object for storing Kubelt Application state.

// TODO this decorator adds RPC methods that allow the component to
// be treated as a graph node.
// - [optional] constrain the types of edges
// - [optional] provide edge type (allowed properties)
// - [optional] constrain types of target node?
// - [optional] conform to EdgeStorage interface
//   - [default] ComponentStorage: store in DO state
//   - KVStorage: store in KV store
//   - D1Storage: store in D1 database
//   - RPCStorage: make remote RPC call to store edge
//@node()

// TODO list allowed signers (provide public key(s))
// @signer()

/**
 * Stores state that describes a Starbase application.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
@component(schema)
@scopes([
  "owner",
  "starbase.read",
  "starbase.write",
])
@field({
  name: "app",
  doc: "An application object",
  defaultValue: {},
  /*
  scopes: {
    read: ["starbase.read"],
    write: ["starbase.write"],
  },
  validator: (x) => { return true },
  */
})
export class StarbaseApplication {

  // app_store
  // ---------------------------------------------------------------------------

  // Mark this method as being the implementation of the app_store
  // method from the OpenRPC schema.
  @method("app_store")
  // The write scope is required to invoke this method. If the caller
  // lacks the scope they receive an error method indicating that they
  // lack permission, and this method handler is not invoked.
  @requiredScope("starbase.write")
  // Allow this method to update the value of the "app" field of the
  // component.
  @requiredField("app", [FieldAccess.Read, FieldAccess.Write])
  // The RPC method implementation.
  async appStore(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {

    if (!params.has("app")) {
      const message = `missing parameter "app" from request`;
      console.error(message);
      // TODO need a better way to return errors:
      // - additional RpcCallable parameter that is an error map; errors
      //   set on that map trigger the return of a JSON-RPC error
      //   response.
      // - exceptions
      return Promise.resolve({
        invoked: "app_store",
        error: message,
      });
    }

    // Read the supplied "app" request parameter and write it to the
    // output "app" field.
    const app = params.get("app");
    output.set("app", app);

    return Promise.resolve({
      invoked: "app_store",
      stored: app,
    });
  }

  // app_fetch
  // -----------------------------------------------------------------------------

  @method("app_fetch")
  @requiredScope("starbase.read")
  @requiredField("app", [FieldAccess.Read])
  appFetch(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    const app = input.get("app");

    return Promise.resolve(app);
  }

  // public_profile
  // -----------------------------------------------------------------------------

  @method("public_profile")
  @requiredScope("starbase.read")
  @requiredField("app", [FieldAccess.Read])
  publicProfile(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    const app = input.get("app")

    // If the application is not published we shouldn't return any
    // information.
    let profile = {}
    if (app?.published == true) {
      profile = _.omit(app, [
        'clientSecret',
        'published',
      ])
    }

    return Promise.resolve(profile)
  }

  // ---------------------------------------------------------------------------
  // COMPONENT
  // ---------------------------------------------------------------------------

  // rpc.discover
  // ---------------------------------------------------------------------------
  // Fetch the schema declared by the component.
  //
  // NB: this is a native feature of our underlying OpenRPC library. We don't
  // need special support for it at the component level, unlike with our extensions.

  // cmp.delete
  // ---------------------------------------------------------------------------
  // NB: we delete a durable object by deleting everything within it
  // (storage.deleteAll). Once the DO shuts down the DO ceases to exist.

  // cmp.scopes
  // -----------------------------------------------------------------------------
  // Returns a list of the scopes declared by the component.

} // END StarbaseApp
