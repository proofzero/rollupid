/**
 * @module @kubelt/do.starbase
 * @file src/index.ts
 */

import type {
  RpcRequest,
  RpcResponse,
} from "@kubelt/openrpc";

import {
  rpcObject,
  rpcScopes,
  rpcMethod,
  requiredScope,
} from "@kubelt/openrpc/component";

// The OpenRPC schema that defines the RPC API provided by the Durable Object.
import schema from "./schema";

// StarbaseApp
// -----------------------------------------------------------------------------
// A Durable Object for storing Kubelt Application state.

/**
 * Stores state that describes a Starbase application.
 *
 * @note This class needs to implement all of the methods defined in
 * the OpenRPC schema or an error will be thrown upon construction.
 */
@rpcObject(schema)
@rpcScopes([
  "starbase.read",
  "starbase.write",
])

// TODO list allowed signers (provide public key(s))
// @signerPublicKey()

// TODO define data fields
// @field({
//   name: "app_name",
//   doc: "docs about this state"
//   scopes: [<required scopes to access?>]
//   default: "",
//   validator: (x) => { return true },
// })
export class StarbaseApp {

  // app_name
  // ---------------------------------------------------------------------------

  // Mark this method as being the implementation of a specific method
  // from the OpenRPC schema.
  @rpcMethod("app_name")

  // Defines the JWT issuer(s) that must have issued the JWT provided with
  // a request that invokes this method. This is determined by the "iss"
  // field of the incoming request JWT. Possibly this can also be specified
  // at the class level to set a default for all methods.
  //@requiredIssuer()

  // Defines the set of users allowed to invoke this method. This can be
  // a predefined user identifier, a list of user identifiers, or a predicate
  // that tests whether or not the user should be permitted. The user is
  // determined by the "sub" (subject) field of the request JWT.
  //@requiredUser(["joe", "@xdeadbeef"])

  // A scope that is required to invoke this method. If the caller lacks
  // the scope they receive an error method indicating that they lack
  // permission, and this method handler is not invoked.
  @requiredScope("starbase.read")
  @requiredScope("starbase.xxx")

  // A list of state fields that this method may read. They are injected
  // as the "state" method parameter, a map.
  //@readState(["app_name"])

  // A list of the state fields that this method may update. The method
  // returns a map of these state fields in order to update the state
  // stored for the object. State field validators are applied and if any
  // fields fail validation an error response is returned. If any state
  // fields are returned that are not listed here we can return an error
  // (strict mode) or ignore them without updating state (permissive mode).
  //@writeState([])

  // Inject an environment variable value (defined in wrangler.toml).
  //@requiredEnvironment("USER_NAME")

  // Inject a secret value (defined using the wrangler CLI or in the CF console).
  //@requiredSecret("DATADOG_API_KEY")

  // Indicates which remote service RPC clients are required. These are
  // injected to allow the user to make RPC calls to remote services
  // that have configured service bindings.
  //@requiredRemote()

  appName(
    request: RpcRequest,
    state: Map<string, any>,
    context: Map<string, any>,
    remote: Map<string, any>,
  ): RpcResponse {
    // Indicate a reply by using request ID (if provided).
    const replyId = (undefined !== request?.id) ? request.id : null;
    return {
      jsonrpc: "2.0",
      id: replyId,
      result: {
        invoked: "app_name",
        context: "StarbaseApp",
      },
    };
    // TODO return updated state
  }

  // app_create
  // ---------------------------------------------------------------------------

  /*
  @rpcMethod("app_create")
  @requiredScope("starbase.write")
  appCreate(
    request: RpcRequest,
    state: Map<string, any>,
    context: Map<string, any>,
    remote: Map<string, any>,
  ) {
    // Indicate a reply by using request ID (if provided).
    const replyId = (undefined !== request?.id) ? request.id : null;
    return {
      jsonrpc: "2.0",
      id: replyId,
      result: {
        invoked: "app_create",
      },
    };
    // TODO return updated state
  }
  */

  // app_fetch
  // -----------------------------------------------------------------------------

  // app_update
  // ---------------------------------------------------------------------------

  // app_delete
  // ---------------------------------------------------------------------------

  // app_list
  // ---------------------------------------------------------------------------


} // END StarbaseApp
