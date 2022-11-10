/**
 * @file impl/index.ts
 */

import * as _ from "lodash";

import * as set from "ts-set-utils";

// TODO use for JSON-Schema validation.
/*
import {
  Validator
} from "@cfworker/json-schema";
*/

// Load the OpenRPC JSON Schema for a schema document.
import type {
  ContentDescriptorObject,
  ContentDescriptorObjectName,
  MethodObject,
  MethodOrReference,
  Methods,
  OpenrpcDocument,
} from "@open-rpc/meta-schema";

import type {
  MiddlewareFn,
  MiddlewareResult,
} from "./router";

import {
  RpcClient,
  RpcClientOptions,
} from "./client";

import {
  RpcContext,
} from "./context";

import {
  preflight as preflightScopes,
} from "./scopes";

import * as jsonrpc from "./jsonrpc";

import * as router from "./router";

// Types
// -----------------------------------------------------------------------------

// Type alias for an @openrpc/meta-schema. The user should define their
// RPC service schema as this type to ensure that it conforms with the
// OpenRPC spec.
export type RpcSchema = OpenrpcDocument;

// An RpcRequest represents a parsed Request that conforms to the
// JSON-RPC request spec.
export type RpcRequest = jsonrpc.JsonRpcRequest;

export type RpcResponse = jsonrpc.JsonRpcResponse;

export type RpcError = jsonrpc.JsonRpcErrorResponse;

// The standard JSON-RPC object that describes the error that occurred.
export type RpcErrorDetail = jsonrpc.JsonRpcError;

export type RpcPath = string;

// A chain is a sequence of router handler functions.
export type RpcChain = ReadonlyArray<MiddlewareFn>;

export type RpcService = {
  // The OpenRPC schema defining the service.
  schema: Readonly<RpcSchema>;
  // Set of all declared scopes.
  scopes: ScopeSet;
  // The set of method implementations.
  methods: RpcMethods;
  // The set of method extensions.
  extensions: RpcMethods;
};

export type RpcHandler = (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>,
) => Promise<Readonly<RpcResponse>>;

interface Options {
  // Whether or not to enable OpenRPC service discovery.
  rpcDiscover: boolean,
};
export type RpcOptions = Partial<Options>;

// A permission representing the ability to invoke an RPC method.
export type Scope = symbol;

// A collection of scopes.
export type ScopeSet = Set<Scope>;

// TODO collect readable, writable state.
export type RpcMethod = {
  // The name of the method.
  name: symbol,
  // An OpenRPC partial schema for a single method.
  schema: Readonly<MethodObject>,
  // The set of scopes required to call the method.
  scopes: Readonly<ScopeSet>,
  // An RPC handler function to invoke when method is called.
  handler: Readonly<RpcHandler>,
};

export type RpcMethodSet = Array<RpcMethod>;

// A map from RPC request method to handler function.
export type RpcMethods = Map<symbol, RpcMethod>;

// When the user supplies a ServiceExtension definition it's so that the
// canonical name of the method, stored at the "name" property of an
// Rpcmethod, will be created from the given schema's name string.
export type ServiceExtension = Omit<RpcMethod, "name">;

// The name of an OpenRPC method as per the meta-schema.
type RpcMethodName = ContentDescriptorObjectName;

export type ServiceMethod = {
  name: RpcMethodName;
  scopes: Readonly<ScopeSet>;
  handler: Readonly<RpcHandler>;
};

// When a chain function returns null/undefined, processing of the chain
// continues. If a Response is returned execution of the chain is
// short-circuited and the Response is returned.
type RpcChainResult = RpcResponse | RpcContext;

// A chain function maps a request and associated context map into a new
// context map.
export type RpcChainFn = (request: Request, ctx: RpcContext) => Promise<RpcChainResult>;

// This is the type of an RPC handler that takes a Request provided by
// Cloudflare (and an optional context map), and returns a Response to
// be returned to the caller. The Request is expected to contain a JSON-RPC
// format request and the returned Response is also JSON-RPC format.
export type OpenRpcHandler = (
  request: Readonly<Request>,
  context?: Readonly<RpcContext>,
) => Promise<Response>;

// context
// -----------------------------------------------------------------------------

export function context(): RpcContext {
  return new RpcContext();
}

// options
// -----------------------------------------------------------------------------

export function options(
  opt: Readonly<RpcOptions>,
): RpcOptions {
  return opt;
}

// chain
// -----------------------------------------------------------------------------

export function chain(
  rpcChain: Readonly<RpcChain>,
): Readonly<RpcChain> {
  return rpcChain;
}

// middleware
// -----------------------------------------------------------------------------

export function middleware(
  f: Readonly<RpcChainFn>,
): MiddlewareFn {
  // The itty router invokes treats handler functions as middleware if
  // they have no return value, but if a Response is returned it
  // short-circuits and returns the Response directly without evaluating
  // any more handlers.
  return async (
    request: Readonly<Request>,
    context: Readonly<RpcContext>,
  ): MiddlewareResult => {
    const result = await (<RpcChainFn>f)(request, context);
    if (result instanceof Response) {
      return Promise.resolve(result);
    }
  };
}

// response
// -----------------------------------------------------------------------------

export function response(
  request: Readonly<RpcRequest>,
  result: any,
): Promise<Readonly<RpcResponse>> {
  // TODO use jsonrpc methods to construct response
  return Promise.resolve({
    jsonrpc: "2.0",
    id: request.id || null,
    result,
  });
}

// error
// -----------------------------------------------------------------------------

export function error(
  request: Readonly<RpcRequest>,
  detail: Readonly<RpcErrorDetail>,
): Promise<Readonly<RpcError>> {
  return Promise.resolve(jsonrpc.error(request, detail));
}

// methods
// -----------------------------------------------------------------------------

export function methods(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>,
): Readonly<RpcMethods> {
  const methodMap: RpcMethods = new Map();
  for (const m of methodSet) {
    //const { name: methodName, handler: methodFn, scopes: methodScopes } = m;
    //const methodSym = Symbol.for(methodName.trim());
    //const methodSchema = findMethod(schema, methodName);
    /*
      methodSym, {
        name: methodSym,
        schema: methodSchema,
        scopes: methodScopes,
        handler: methodFn,
      })
    */
    methodMap.set(m.name, m);
  }

  // Extract the collection of expected method names.
  const required: Readonly<Set<symbol>> = new Set(
    schema.methods.map((method: MethodOrReference): symbol => {
      if (method.hasOwnProperty("name")) {
        return Symbol.for((<MethodObject>method).name);
      } else {
        throw new Error("schema method references are not currently supported");
      }
    })
  );
  // Extract the collection of supplied method names.
  const supplied: Readonly<Set<symbol>> = new Set(methodMap.keys());
  // Ensure that every RPC method defined in the schema has a matching
  // handler function in the method map.
  if (!set.subset(supplied, required)) {
    const missing = set.difference(required, supplied);
    const message = _.join(_.map([...missing], Symbol.keyFor), ', ');
    throw new Error(`missing RPC methods: ${message}`);
  }

  return methodMap;
}

// method
// -----------------------------------------------------------------------------

export function method(
  schema: Readonly<RpcSchema>,
  serviceMethod: Readonly<ServiceMethod>,
): Readonly<RpcMethod> {
  const {
    name,
    scopes: methodScopes,
    handler: methodHandler,
  } = serviceMethod;

  // TODO move to utility namespace.
  function findMethod(
    schema: Readonly<RpcSchema>,
    methodName: string,
  ): MethodObject {
    // TODO the method description is a MethodOrReference; only the MethodObject
    // has a .name property. ReferenceObject needs to be expanded.
    const methodOrReference: MethodOrReference | undefined = schema.methods.find(methodObj => {
      if (methodObj.hasOwnProperty("name")) {
        return (<MethodObject>methodObj).name === methodName;
      }
      return false;
    });
    if (undefined === methodOrReference) {
      throw new Error(`schema description for ${methodName} not found`);
    }
    // FIXME check that we have a MethodObject
    if (!methodOrReference.hasOwnProperty("name")) {
      throw new Error(`schema description for ${methodName} must be expanded`);
    }
    return <MethodObject>methodOrReference;
  }

  const methodName = name.trim();
  // TODO utility fn to make method symbol
  const methodSym = Symbol.for(methodName);

  // [ { <method> }, ..., { <method } ]
  const methods: ReadonlyArray<MethodOrReference> = schema.methods;
  // Look up the partial schema that describes the method being implemented.
  const methodSchema = findMethod(schema, methodName);

  if (undefined === methodSchema) {
    throw Error(`can't find method ${name} in the schema`);
  }

  return {
    name: methodSym,
    schema: methodSchema,
    scopes: methodScopes,
    handler: methodHandler,
  };
}

// handler
// -----------------------------------------------------------------------------

export function handler(
  f: Readonly<RpcHandler>,
): Readonly<RpcHandler> {
  return f;
}

// extensions
// -----------------------------------------------------------------------------

export function extensions(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>,
): Readonly<RpcMethods> {
  const methodMap: RpcMethods = new Map();
  for (const m of methodSet) {
    methodMap.set(m.name, m);
  }
  return methodMap;
}

// extension
// -----------------------------------------------------------------------------

export function extension(
  schema: Readonly<RpcSchema>,
  ext: Readonly<ServiceExtension>,
): Readonly<RpcMethod> {
  const {
    schema: methodSchema,
    scopes: methodScopes,
    handler: methodFn,
  } = ext;

  // TODO expand the method schema against the provided service schema.

  const methodName = methodSchema.name.trim();
  const methodSym = Symbol.for(methodName);

  return {
    name: methodSym,
    schema: methodSchema,
    scopes: methodScopes,
    handler: methodFn,
  };
}

// extend
// -----------------------------------------------------------------------------

export function extend(
  service: Readonly<RpcService>,
  method: Readonly<RpcMethod>,
): Readonly<RpcService> {
  const {
    name: methodName,
    schema: methodSchema,
    scopes: methodScopes,
    handler: methodFn,
  } = method;

  if (service.extensions.has(methodName)) {
    throw new Error(`cannot replace method ${methodName.description} in service`);
  }

  // Include the extension method is the service's map of extensions.
  const extensions = new Map(service.extensions);
  extensions.set(methodName, method);

  return {
    ...service,
    extensions,
  };
}

// scope
// -----------------------------------------------------------------------------

export function scope(
  name: string | Scope,
): Scope {
  return (typeof(name) === "string") ?
    Symbol.for(name.trim().toLowerCase()) :
    name
  ;
}

// scopes
// -----------------------------------------------------------------------------

export function scopes(
  list: ReadonlyArray<string|Scope>,
): Readonly<ScopeSet> {
  return new Set(list.map(x => scope(x)));
}

// service
// -----------------------------------------------------------------------------

export function service(
  schema: Readonly<RpcSchema>,
  allScopes: Readonly<ScopeSet>,
  methods: Readonly<RpcMethods>,
  extensions: Readonly<RpcMethods>,
  clientOptions: Readonly<RpcOptions>,
): Readonly<RpcService> {
  // We include the service discovery method by default.
  const options: RpcOptions = _.merge({}, clientOptions, {
    rpcDiscover: (clientOptions?.rpcDiscover !== undefined) ?
      clientOptions.rpcDiscover :
      true,
  });

  // Checks that all scopes required by methods AND extensions are
  // declared at the component level. Throws if that is not the case.
  preflightScopes(allScopes, methods, extensions);

  let svc: RpcService = {
    schema,
    scopes: allScopes,
    methods,
    extensions,
  }

  // The OpenRPC spec defines a mechanism for service discovery. The
  // request method rpc.discover is added by default and when called
  // returns an OpenRPC schema document (as JSON) for the service.
  if (options.rpcDiscover) {
    // TODO move into impl/discover.

    // Because service discovery is enabled, add the standard rpc.discover
    // RPC method (as defined by the OpenRPC specification) into the method map
    // and update the schema.

    const rpcDiscover: RpcMethod = extension(schema, {
      schema: {
        name: "rpc.discover",
        description: "Returns an OpenRPC schema as a description of this service",
        params: [],
        result: {
          name: "OpenRPC Schema",
          schema: {
            "$ref": "https://raw.githubusercontent.com/open-rpc/meta-schema/master/schema.json"
          }
        }
      },
      // No scopes required to call rpc.discover.
      scopes: scopes([]),
      handler: handler(
        async (
          service: Readonly<RpcService>,
          request: Readonly<RpcRequest>,
          context: Readonly<RpcContext>,
        ): Promise<Readonly<RpcResponse>> => {
          // Each extension value is an RpcMethod; the "schema" property
          // contains the OpenRPC MethodObject for method.
          const extMethods = _.map([...service.extensions.values()], "schema");
          const methods = _.concat([...schema.methods], extMethods);

          const result = {
            ...schema,
            methods,
          };
          return response(request, result);
        }),
    });

    // Extend the service with the method.
    svc = extend(svc, rpcDiscover);
  }

  return svc;
}

// build
// -----------------------------------------------------------------------------

export function build(
  service: Readonly<RpcService>,
  base: Readonly<RpcPath>,
  root: Readonly<RpcPath>,
  chain: Readonly<RpcChain>,
): OpenRpcHandler {
  // Construct URL instances for validation purposes, even though we
  // only bother with the path component of the resulting URLs.
  const ignoredBase = "https://ignore.me";

  const baseURL = new URL(base, ignoredBase);
  const basePath = baseURL.pathname;

  const rootURL = new URL(root, ignoredBase);
  const rootPath = rootURL.pathname;

  // The router handles POSTS to the rootPath by invoking an appropriate
  // method from the method map to generate the result. Everything else
  // generates a 404.
  const rpcRouter = router.init(service, basePath, rootPath, chain);

  // Return an RPC request handler.
  //
  // We pass in a context map to supply extra information during request
  // handling. Extensions may be registered to populate the context with
  // useful information, e.g. host-supplied information attached to the
  // incoming request.
  return async (request: Request, context: RpcContext = new Map()): Promise<Response> => {
    // Returns a Promise<any> that resolves with the first matching
    // route handler that returns something (or none at all if there is
    // no match). In the case where no route matches we return an
    // appropriate RPC error message.
    //
    // Make sure we clone the request we're handling, as each request
    // can only be read once.
    return rpcRouter.handle(request.clone(), context);
  };
}

// client
// -----------------------------------------------------------------------------
// TODO add options to specify a prefix or otherwise determine which are
// "internal" and "external" methods
//
// TODO add option to specify if method names should be made idiomatic
// (camelCased)

export function client(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  schema: RpcSchema,
  options: RpcClientOptions,
): RpcClient {
  // TODO call cmp.ping with client to validate, only if it exists.
  return new RpcClient(durableObject, name, schema, options);
}

// discover
// -----------------------------------------------------------------------------

export async function discover(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  options: RpcClientOptions,
): Promise<RpcClient> {
  // Get a reference to the named durable object.
  const objId = durableObject.idFromName(name);
  const app = durableObject.get(objId);

  // This base URL is ignored for routing purposes since the calls are
  // dispatched using an object stub. Instead we encode the name of the
  // durable object into the URL for informational purposes, e.g. when
  // logging.

  // TODO extract durable object name and use for this URL, if possible.
  const tag = options?.tag || "do.unknown";
  const baseURL = `https://${tag}`;
  // If we use ${objId} in the URL it is REDACTED in the logs.
  const url = new URL(`/openrpc`, baseURL);

  // TODO use generic JSON-RPC client;
  // - impl.jsonrpc.request() to build request
  // - impl.jsonrpc.execute(req) to execute request

  const rpcRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "rpc.discover",
  };
  const body = JSON.stringify(rpcRequest);

  const request = new Request(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  // TODO check response status
  const response = await app.fetch(request);
  if (!response.ok) {
    // TODO
  }

  // TODO handle parse errors
  // TODO validate against OpenRPC meta-schema
  // TODO perform a type assertion
  const rpcJSON: RpcResponse = await response.json();

  // TODO check for .result or .error
  if (rpcJSON.hasOwnProperty("result")) {
    const schemaJSON = _.get(rpcJSON, "result");
    const schema: RpcSchema = schemaJSON;
    return client(durableObject, name, schema, options);
  }

  // TODO better error handling
  throw new Error(_.get(response, "error", "unknown error"));
}
