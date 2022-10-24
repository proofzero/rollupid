/**
 * @file src/index.ts
 *
 * This Cloudflare worker provides an OpenRPC backend for the Kubelt
 * Starbase application.
 */

import * as _ from "lodash";

import * as openrpc from "@kubelt/openrpc";
import { default as mwAnalytics } from "@kubelt/openrpc/middleware/analytics";
import { default as mwAuthenticate } from "@kubelt/openrpc/middleware/authenticate";
import { default as mwDatadog } from "@kubelt/openrpc/middleware/datadog";
import { default as mwGeolocation } from "@kubelt/openrpc/middleware/geolocation";
import { default as mwOort } from "@kubelt/openrpc/middleware/oort";

import { StarbaseApp } from "@kubelt/do.starbase";

import * as middle from "./middleware";

// Durable Objects
// -----------------------------------------------------------------------------
// We need to export any Durable Objects we use.

export { StarbaseApp };

// Methods
// -----------------------------------------------------------------------------
// These are the method handler implementations for the RPC methods
// defined in the OpenRPC API schema.

// NB: we are not yet validating the incoming RPC request against the schema!

const app_create = openrpc.method("app_create", async (request, context) => {
  // Note that the request we are given is a parsed RpcRequest. It's not
  // an HTTP Request that we can forward directly to the durable object!

  //console.log(request);

  // Get a reference to the StarbaseApp Durable Object.
  const starbase = context.get("com.kubelt.object/starbase");

  // TODO Initialize an RPC client for the DO:
  // - openrpc.client(schema); <= when schema already available
  // - openrpc.discover(url); <= for OpenRPC discovery
  //
  // TODO Make the desired call(s) against the object.

  // TEMP make this type check so we can run dev:miniflare. It would be
  // better if these types were generated from the schema.
  type AppCreateParams = {
    ownerId: string;
    appId: string;
  };
  const params = <AppCreateParams>request?.params;
  const ownerId = params?.ownerId;
  const appId = params?.appId;

  // Should we use randomly generated name for better performance? Alternately,
  // should we hash our own identifier into a hex string to use as the name?
  const objName = `${ownerId}/${appId}`;
  const objId = starbase.idFromName(objName);
  const app = starbase.get(objId);

  // This base URL is ignored for routing purposes since the calls are
  // dispatched using an object stub. Instead we encode the name of the
  // durable object into the URL for informational purposes, e.g. when
  // logging.
  const baseURL = `https://do.starbase`;

  // If we use ${objId} in the URL it is REDACTED in the logs.
  const url = new URL(`/openrpc`, baseURL);
  //console.log(url);

  // The RPC request to make to the remote object.
  const nameRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "app_name",
  };
  // Note that workers can pass state to durable objects via headers, the
  // HTTP method, the Request body, or the Request URI. Does it make sense
  // to supply that information as part of the RpcRequest as extra context?
  const doRequest = new Request(url.toString(), {
    body: JSON.stringify(nameRequest),
    headers: { "Example-Header": "example", "Content-Type": "application/json", },
    method: "POST",
    //redirect
    //cf
  });
  const sbResponse = await app.fetch(doRequest);
  const doText = await sbResponse.json();

  // TODO
  const result = {
    invoked: "app_create",
    doText,
  };
  return openrpc.response(request, result);
});

const app_fetch = openrpc.method("app_fetch", async (request, context) => {
  // TODO
  const result = {
    invoked: "app_fetch",
  };
  return openrpc.response(request, result);
});

const app_delete = openrpc.method("app_delete", async (request, context) => {
  // TODO
  const result = {
    invoked: "app_delete",
  };
  return openrpc.response(request, result);
});

const app_update = openrpc.method("app_update", async (request, context) => {
  // TODO
  const result = {
    invoked: "app_update",
  };
  return openrpc.response(request, result);
});

const app_list = openrpc.method("app_list", async (request, context) => {
  // TODO
  const result = {
    invoked: "app_list",
  };
  return openrpc.response(request, result);
});

// Setup
// -----------------------------------------------------------------------------
// Perform the work of setting up the RPC API upon startup; no need to
// do this work with each API request unless there's some that needs to
// be constructed dynamically using values taken from the request,
// environment, or execution context.

// Import the OpenRPC schema for this API.
import schema from "./schema";

// Construct a sequence of middleware to execute.
const chain = openrpc.chain([
  // Authenticate using a JWT in the request.
  mwAuthenticate,
  // Extra geolocation data provided by Cloudflare.
  mwGeolocation,
  // Cloudflare Worker analytics.
  mwAnalytics,
  // Construct a Datadog client for sending metrics.
  mwDatadog,
  // Construct an Oort client for talking to the Kubelt backend.
  mwOort,
  // An example middleware defined locally.
  middle.example,
]);

// Supply implementations for all of the API methods in the schema.
const methods = openrpc.methods(schema, [
  app_create,
  app_fetch,
  app_delete,
  app_update,
  app_list,
]);

// Configuration options for the API.
const options = openrpc.options({
  // Enable OpenRPC service discovery.
  rpcDiscover: true,
});

// All requests whose path is "under" this location are handled by
// returned a 404 *unless* the request happens to be the root path.
// If the base path is the same as the root path, you will need to handle
// any request that isn't to the root path yourself.
const basePath = "/";

// The RPC resource endpoint; requests to this path are handled as RPC requests.
const rootPath = "/openrpc";

// The returned handler validates the incoming request, routes it to the
// correct method handler, and executes the handler on the request to
// generate the response.
const rpcHandler = openrpc.handler(
  basePath,
  rootPath,
  schema,
  methods,
  chain,
  options
);

// Environment
// -----------------------------------------------------------------------------
// Describe the expected shape of the Cloudflare-provided environment.

export interface Env {
  // KV Namespaces
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/

  // Example binding to KV.
  // MY_KV_NAMESPACE: KVNamespace;

  // Durable Objects
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/

  // A binding to the object representing a single Starbase application.
  STARBASE_APP: StarbaseApp;

  // Buckets
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/

  // The bucket where application icons are stored.
  //ICON_BUCKET: R2Bucket;

  // Service bindings
  // ---------------------------------------------------------------------------

  // A binding to the relay service.
  //RELAY: Fetcher;

  // Environment variables
  // ---------------------------------------------------------------------------

  // Example environment variable.
  USER_NAME: string,

  // Secrets
  // ---------------------------------------------------------------------------

  // Datadog client token.
  DATADOG_TOKEN: string,
}

// Worker
// -----------------------------------------------------------------------------

/**
 * @param request A Request instance containing the request to handle.
 * @param env An object containing environment bindings.
 * @param ctx A request execution context.
 *
 * @return An HTTP response.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Use this Map to inject per-request context into the request
    // handlers. This might include:
    // - environment variables
    // - service bindings
    // - bucket bindings
    // - kv bindings
    // - durable objects
    // etc.
    //
    // NB: this context is available to "extensions" (middleware) that
    // are executed as part of the request chain. That means you can add
    // API tokens here and construct clients in the middleware if they
    // need to be constructed dynamically. Note that it is idiomatic to
    // use reverse-TLD namespaced keys in the context map to allow
    // third-party extensions to avoid setting conflicting keys.
    //
    // NBB: secrets are set via the dashboard or using the wrangler CLI tool.

    // TODO allow context to be initialized in this function.
    const context = openrpc.context();

    context.set('com.example/username', env.USER_NAME);
    // A secret value; the API token for Datadog metrics collection.
    context.set('com.datadog/token', env.DATADOG_TOKEN);
    // A durable object containing Starbase App state.
    context.set('com.kubelt.object/starbase', env.STARBASE_APP);
    // An internal service binding to the "relay" service.
    //context.set('com.kubelt.service/relay', env.RELAY);
    // An R2 bucket where we store uploaded application icons.
    //context.set('com.kubelt.bucket/icons', env.ICON_BUCKET);

    // TODO forward request to authorization service.
    // TODO perform rpc.discover on auth service and create client.

    // TEMP forward requests to relay (just to test!).
    // NB: request must be cloned as it may only be read once.
    /*
    const relayResponse = await env.RELAY.fetch(request.clone());
    if (relayResponse.status !== 200) {
      return new Response(`relay request failed: ${relayResponse.status}`);
    } else {
      const responseText = await relayResponse.text();
      return new Response(`relay result: ${relayResponse.status} ${responseText}`);
    }
    */

    // NB: the handler clones the request; we don't need to do it here.
    return rpcHandler(request, context);
  },
};
