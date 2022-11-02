/**
 * An OpenRPC service framework for Cloudflare Workers.
 *
 * @file openrpc/index.ts
 */

import * as _ from "lodash";
import * as set from "ts-set-utils";
import invariant from "tiny-invariant";

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
  OpenrpcDocument,
} from "@open-rpc/meta-schema";

import type {
  MiddlewareFn,
  MiddlewareResult,
} from "./impl/router";

import * as jsonrpc from "./impl/jsonrpc";
import * as router from "./impl/router";
import { preflight as preflightScopes } from "./impl/scopes";

// TODO push implementations into sub-module

// Types
// -----------------------------------------------------------------------------

export type {
  MiddlewareFn,
  MiddlewareResult,
};

// An RpcRequest represents a parsed Request that conforms to the
// JSON-RPC request spec.
export type RpcRequest = jsonrpc.JsonRpcRequest;

export type RpcResponse = jsonrpc.JsonRpcResponse;

export type RpcError = jsonrpc.JsonRpcErrorResponse;

// The standard JSON-RPC object that describes the error that occurred.
export type RpcErrorDetail = jsonrpc.JsonRpcError;

export type RpcPath = string;

// Type alias for an @openrpc/meta-schema. The user should define their
// RPC service schema as this type to ensure that it conforms with the
// OpenRPC spec.
export type RpcSchema = OpenrpcDocument;

// Extra context to make available while processing a request.

// We specialize Map to use _.set() and _.get() for setting and
// retrieving values as these methods do a good job of handling
// path-like keys, i.e. com.kubelt.geo/location gets mapped into:
// {
//   com: {
//     kubelt: {
//       "geo/location": {
//         ...
//       }
//     }
//   }
// }
export class RpcContext extends Map<string|Symbol, any> {
  get(k: string|Symbol): any {
    if (k instanceof Symbol) {
      k = k.toString();
    }
    return _.get(this, k);
  }
  set(k: string|Symbol, v: any): this {
    if (k instanceof Symbol) {
      k = k.toString();
    }
    _.set(this, k, v);
    return this;
  }
};

// When a chain function returns null/undefined, processing of the chain
// continues. If a Response is returned execution of the chain is
// short-circuited and the Response is returned.
export type RpcChainResult = RpcResponse | RpcContext;

// A chain function maps a request and associated context map into a new
// context map.
type RpcChainFn = (request: Request, ctx: RpcContext) => Promise<RpcChainResult>;

// A chain is a sequence of router handler functions.
export type RpcChain = Array<MiddlewareFn>;

export type RpcHandler = (request: RpcRequest, context: RpcContext) => Promise<RpcResponse>;

// TODO collect readable, writable state.
export type RpcMethod = {
  // The name of the method.
  name: symbol,
  // An OpenRPC partial schema for a single method.
  schema: MethodObject,
  // The set of scopes required to call the method.
  scopes: ScopeSet,
  // An RPC handler function to invoke when method is called.
  handler: RpcHandler,
};

// A map from RPC request method to handler function.
export type RpcMethods = Map<symbol, RpcMethod>;

interface Options {
  // Whether or not to enable OpenRPC service discovery.
  rpcDiscover: boolean,
};
export type RpcOptions = Partial<Options>;

// This is the type of an RPC handler that takes a Request provided by
// Cloudflare (and an optional context map), and returns a Response to
// be returned to the caller. The Request is expected to contain a JSON-RPC
// format request and the returned Response is also JSON-RPC format.
export type OpenRpcHandler = (request: Request, context?: RpcContext) => Promise<Response>;

// A permission representing the ability to invoke an RPC method.
export type Scope = Symbol;

// A collection of scopes.
export type ScopeSet = Set<Scope>;

export type RpcService = {
  // The OpenRPC schema defining the service.
  schema: RpcSchema;
  // Set of all declared scopes.
  scopes: ScopeSet;
  // The set of method implementations.
  methods: RpcMethods;
};

// The name of an OpenRPC method as per the meta-schema.
type RpcMethodName = ContentDescriptorObjectName;

type ServiceMethod = {
  name: RpcMethodName,
  scopes: ScopeSet,
  handler: RpcHandler,
}

type ServiceExtension = {
  schema: MethodObject,
  scopes: ScopeSet,
  handler: RpcHandler,
};

type RpcMethodSet = Array<RpcMethod>;

//
// INTERNAL
//

// TODO move to impl
function findMethod(schema: RpcSchema, methodName: string): MethodObject {
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

//
// PUBLIC
//

// context
// -----------------------------------------------------------------------------
// TODO move to impl/context

/**
 * Construct a new request context.
 */
export const context = (): RpcContext => {
  return new RpcContext();
};

// options
// -----------------------------------------------------------------------------
// TODO move to impl/service

export const options = (opt: RpcOptions): RpcOptions => {
  return opt;
};

// chain
// -----------------------------------------------------------------------------
// TODO move to impl/middleware? impl/router?

export const chain = (rpcChain: RpcChain): RpcChain => {
  return rpcChain;
}

// middleware
// -----------------------------------------------------------------------------
// TODO move to impl/middleware? impl/router?

/**
 * Turn an RpcChainFn, that returns either a Response or an updated
 * Context into a handler function that implements the expected
 * behaviour of an itty handler function, i.e. returns null (to continue
 * executing) or a Response (to stop routing and return the response
 * immediately).
 */
export const middleware = (f: RpcChainFn): MiddlewareFn => {
  // The itty router invokes treats handler functions as middleware if
  // they have no return value, but if a Response is returned it
  // short-circuits and returns the Response directly without evaluating
  // any more handlers.
  return async (request: Request, context: RpcContext): MiddlewareResult => {
    const result = await f(request, context);
    if (result instanceof Response) {
      return Promise.resolve(result);
    }
  };
};

// response
// -----------------------------------------------------------------------------
// TODO move to impl/response?

/**
 * Return an RPC response for a given request. The result to include in
 * the response must be supplied and will be included in the returned
 * response.
 *
 * @param request the request that is being responded to
 * @param result a value to send as the result of the RPC call
 *
 * @return
 */
export const response = async (request: RpcRequest, result: any): Promise<RpcResponse> => {
  // TODO use jsonrpc methods to construct response
  return Promise.resolve({
    jsonrpc: "2.0",
    id: request.id || null,
    result,
  });
}

// error
// -----------------------------------------------------------------------------
// TODO move to impl/response?

/**
 *
 */
export function error(request: RpcRequest, detail: RpcErrorDetail): Promise<RpcError> {
  return Promise.resolve(jsonrpc.error(request, detail));
};

// methods
// -----------------------------------------------------------------------------
// TODO move to impl/method? impl/service?

// NB: Symbol('...') always returns a *new* Symbol even if the symbol
// key is the same. To intern a symbol in the "global symbol table"
// use Symbol.for('...'), which returns the unique symbol
// corresponding to the key. Use Symbol.keyFor() to extract the symbol
// key from a Symbol.

/**
 * Given an OpenRPC schema and a sequence of RPC method implementations,
 * return a Map from method name (as Symbol) to method function. The
 * supplied methods are expected to named so as to match the method
 * names defined in the schema. If any of the required methods are *not*
 * supplied an exception is thrown.
 *
 * @param schema An OpenRPC schema defining the API
 * @param methodList An array of RPC request method implementations
 */
export function methods(schema: RpcSchema, methodSet: RpcMethodSet): RpcMethods {
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
  const required: Set<symbol> = new Set(
    schema.methods.map((method: MethodOrReference): symbol => {
      if (method.hasOwnProperty("name")) {
        return Symbol.for((<MethodObject>method).name);
      } else {
        throw new Error("schema method references are not currently supported");
      }
    })
  );
  // Extract the collection of supplied method names.
  const supplied: Set<symbol> = new Set(methodMap.keys());
  // Ensure that every RPC method defined in the schema has a matching
  // handler function in the method map.
  if (!set.subset(supplied, required)) {
    const missing = set.difference(required, supplied);
    const message = _.join(_.map([...missing], Symbol.keyFor), ', ');
    throw new Error(`missing RPC methods: ${message}`);
  }

  return methodMap;
};

// method
// -----------------------------------------------------------------------------
// TODO move to impl/method?

/**
 *
 */
export function method(
  schema: RpcSchema,
  serviceMethod: ServiceMethod,
): RpcMethod {
  const { name, scopes: methodScopes, handler: methodHandler } = serviceMethod;

  const methodName = name.trim();
  // TODO utility fn to make method symbol
  const methodSym = Symbol.for(methodName);

  // [ { <method> }, ..., { <method } ]
  const methods: Array<MethodOrReference> = schema.methods;
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

export function handler(f: RpcHandler): RpcHandler {
  return f;
}

// extensions
// -----------------------------------------------------------------------------

/**
 *
 */
export function extensions(schema: RpcSchema, methodSet: RpcMethodSet): RpcMethods {
  const methodMap: RpcMethods = new Map();
  for (const m of methodSet) {
    methodMap.set(m.name, m);
  }
  return methodMap;
}

// extension
// -----------------------------------------------------------------------------

export function extension(schema: RpcSchema, ext: ServiceExtension): RpcMethod {
  const { schema: methodSchema, scopes: methodScopes, handler: methodFn } = ext;

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

// implement
// -----------------------------------------------------------------------------
// TODO move to impl/service

/**
 * @param name the name of an RPC method name from your schema
 * @param f the RpcHandler function for the API method
 */
/*
function implement(
  service: RpcService,
  name: string,
  handler: RpcHandler,
  scopes: ScopeSet,
): RpcService {
  // [ { <method> }, ..., { <method } ]
  const methods: Array<MethodOrReference> = service.schema.methods;

  // Look up the partial schema that describes the method being implemented.
  const schema = methods.find(method => ( method.name === name.trim() ));
  if (undefined === schema) {
    throw Error(`can't find ${name} in the schema`);
  }

  const methodName = Symbol.for(name.trim());

  service.methods = service.methods.add(methodName, {
    name: methodName,
    schema,
    scopes,
    handler,
  });

  return service;
};
*/

// extend
// -----------------------------------------------------------------------------
// TODO move to impl/service

/**
 * Extend a service with a method that isn't defined in the schema.
 */
function extend(
  service: RpcService,
  ext: ServiceExtension,
): RpcService {
  const { schema: methodSchema, scopes: methodScopes, handler: methodFn } = ext;

  const methodName = methodSchema.name.trim();
  const methodSym = Symbol.for(methodName);

  if (service.methods.has(methodSym)) {
    throw new Error(`cannot replace method ${methodName} in service`);
  }

  // Add the supplied method schema to the service schema.
  service.schema.methods.push(methodSchema);

  const rpcMethod: RpcMethod = {
    name: methodSym,
    schema: methodSchema,
    scopes: methodScopes,
    handler: methodFn,
  };

  service.methods = service.methods.set(methodSym, rpcMethod);

  return service;
}

// scope
// -----------------------------------------------------------------------------
// TODO move implementation to impl/scope.

/**
 *
 */
export function scope(name: string | Scope): Scope {
  return (typeof(name) === "string") ?
    Symbol.for(name.trim().toLowerCase()) :
    name
  ;
}

// scopes
// -----------------------------------------------------------------------------
// TODO move implementation to impl/scope.

/**
 *
 */
export function scopes(list: Array<string|Scope>): ScopeSet {
  return new Set(list.map(x => scope(x)));
}

// service
// -----------------------------------------------------------------------------
// TODO move implementation to impl/service.

/**
 *
 */
export function service(
  schema: RpcSchema,
  allScopes: ScopeSet,
  methods: RpcMethods,
  extensions: RpcMethods,
  options: RpcOptions,
): RpcService {
  // We include the service discovery method by default.
  options.rpcDiscover = (options?.rpcDiscover !== undefined) ?
    options.rpcDiscover :
    true
  ;

  // Add any extensions provided by the user or defined internally.
  extensions.forEach((rpcMethod, rpcName) => {
    methods.set(rpcName, rpcMethod);
    // TODO full schema expansion; assuming we allow the extension
    // schema to include references to component descriptions, etc.
    // in the schema, we'll need to expand the definition.
    schema.methods.push(rpcMethod.schema);
  });

  // Checks that all scopes required by methods AND extensions are
  // declared at the component level. Throws if that is not the case.
  preflightScopes(allScopes, methods, extensions);

  let svc: RpcService = {
    schema,
    scopes: allScopes,
    methods,
  };

  // The OpenRPC spec defines a mechanism for service discovery. The
  // request method rpc.discover is added by default and when called
  // returns an OpenRPC schema document (as JSON) for the service.
  if (options.rpcDiscover) {
    // TODO move into impl/discover.

    // Because service discovery is enabled, add the standard rpc.discover
    // RPC method (as defined by the OpenRPC specification) into the method map
    // and update the schema.
    svc = extend(svc, {
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
      handler: handler(async (request, context): Promise<RpcResponse> => {
        // TODO include extensions.
        return response(request, schema);
      }),
    });
  }

  return svc;
}

// build
// -----------------------------------------------------------------------------
// TODO move implementation to impl/handler.

/**
 * Construct an RPC request handler function.
 *
 * @param path The root path for the API
 * @param schema The OpenRPC schema for the API
 * @param methods A collection of RPC method implementations
 * @param chain A sequence of middleware functions to execute
 * @param options Configuration options for the API
 *
 * @return A function that should be invoked on an incoming Request
 * (optionally including an additional context Map), and which returns
 * an HTTP Response object.
 */
export function build (
  service: RpcService,
  base: RpcPath,
  root: RpcPath,
  chain: RpcChain = [],
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
};
