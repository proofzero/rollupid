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
// Should this version be an argument to @component(schema, "v1")?
//@version("v1")
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
  schemas: {
    v1: {
    }
    v2: {
      up: () => {
        // up migrate to new version
      }
      down: () => {
        // down migrate to old version
      }
      }
  }
  */
})
export class StarbaseApplication {

  // init
  // -----------------------------------------------------------------------------
  // Store the initial copy of the application record.

  @method("init")
  @requiredScope("starbase.write")
  @requiredField("app", [FieldAccess.Read, FieldAccess.Write])
  init(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    const app = params.get("app");

    if (Object.keys(app).length > 0) {
      output.set("app", app)
    } else {
      return Promise.resolve({
        error: `cannot initialize app more than once`,
      })
    }

    return Promise.resolve(app);
  }

  // update
  // ---------------------------------------------------------------------------

  // Mark this method as being the implementation of the app_store
  // method from the OpenRPC schema.
  @method("update")
  // The write scope is required to invoke this method. If the caller
  // lacks the scope they receive an error method indicating that they
  // lack permission, and this method handler is not invoked.
  @requiredScope("starbase.write")
  // Allow this method to update the value of the "app" field of the
  // component.
  @requiredField("app", [FieldAccess.Read, FieldAccess.Write])
  // The RPC method implementation.
  async update(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {

    if (!params.has("profile")) {
      const message = `missing parameter "profile" from request`;
      // TODO need a better way to return errors:
      // - additional RpcCallable parameter that is an error map; errors
      //   set on that map trigger the return of a JSON-RPC error
      //   response.
      // - exceptions
      return Promise.resolve({
        error: message,
      });
    }

    const app = input.get("app")

    // Read the supplied "app" request parameter and write it to the
    // output "app" field.
    const profile = params.get("profile");

    // Make sure there's nothing sensitive in the parameters being
    // updated.
    //
    // NB: that no extraneous fields are set should eventually be
    // validated by application of the schema.
    // TODO: add separate fields for secure / sensitive data
    const updated = _.merge(app, _.omit(profile, [
      'clientId',
      'clientSecret',
      'published',
    ]))

    output.set("app", updated);
    console.log(updated)

    return Promise.resolve({
      profile,
    });
  }

  // fetch
  // -----------------------------------------------------------------------------

  @method("fetch")
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

  // profile
  // -----------------------------------------------------------------------------

  @method("profile")
  @requiredScope("starbase.read")
  @requiredField("app", [FieldAccess.Read])
  publicProfile(
    params: RpcParams,
    input: RpcInput,
    output: RpcOutput,
  ): Promise<RpcResult> {
    const app = input.get('app')

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
