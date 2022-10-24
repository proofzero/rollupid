/**
 * An OpenRPC service framework for Cloudflare Workers.
 *
 * @file openrpc/index.ts
 */

import * as _ from "lodash";

import * as set from "ts-set-utils";

import * as jsonrpc from "./jsonrpc";

import { assert, isIterable } from "./utility";

import { Validator } from "@cfworker/json-schema";

import { Router } from "itty-router";

import { /*error,*/ status } from "itty-router-extras";

// Load the OpenRPC JSON Schema for a schema document.
import { OpenrpcDocument } from "@open-rpc/meta-schema";

import * as metaSchema from "@open-rpc/meta-schema";

// TODO push implementations into sub-module

// Definitions
// -----------------------------------------------------------------------------

// The location in the context map where we store a parsed RPC request.
//
// TODO once extracted and validated, pass in the RpcRequest instance as
// an additional handler parameter alongside request and context?
const REQUEST_CONTEXT_KEY = "com.kubelt.openrpc/request";

// Types
// -----------------------------------------------------------------------------
// TODO create an additional type representing a "chain terminator" that
// *must* return a response. This should be the type of the last handler
// in the routing chain and must be a narrowed version of
// IttyHandlerResult that removes the void response option.

type IttyHandlerResult = Promise<Response|void>;

type IttyHandlerFn = (request: Request, context: RpcContext) => IttyHandlerResult;

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
export type RpcChain = Array<IttyHandlerFn>;

export type RpcHandler = (request: RpcRequest, context: RpcContext) => Promise<RpcResponse>;

// A map from RPC request method to handler function.
export type RpcMethods = Map<Symbol, RpcHandler>;

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

// Router
// -----------------------------------------------------------------------------

/**
 * Update the RPC method map with an OpenRPC service discovery
 * method. The schema will be updated to include an rpc.discover method
 * description, and a corresponding method implementation is added to
 * the method map.
 *
 * @param schema an OpenRPC schema
 * @param methods an RPC method map
 *
 * @return an updated method map with the service discovery method included
 */
const addServiceDiscovery = (schema: RpcSchema, methods: RpcMethods): RpcMethods => {

  // Construct a new list of methods that includes the standard service
  // discovery method description. Done using spread so we don't mutate
  // the schema.
  const rpcMethods = [...schema.methods, {
    name: "rpc.discover",
    description: "Returns an OpenRPC schema as a description of this service",
    params: [],
    result: {
      name: "OpenRPC Schema",
      schema: {
        "$ref": "https://raw.githubusercontent.com/open-rpc/meta-schema/master/schema.json"
      }
    }
  }];
  // Replace the schema.methods array with the new value. Use spread to
  // avoid mutation.
  const result = {...schema, methods: rpcMethods};

  const handler = async (request: RpcRequest, context: RpcContext): Promise<RpcResponse> => {
    // If service discovery is enabled, merge this OpenRPC
    // specification for the service discovery method into the schema
    // before returning it.
    return Promise.resolve({
      jsonrpc: "2.0",
      id: request.id || null,
      result,
    });
  };

  // Add the rpc.discover method to the method map.
  methods.set(Symbol.for("rpc.discover"), handler);

  return methods;
};

/**
 * Return a middleware that extracts the JSON body of a request and
 * converts it into an OpenRpc request. If an error occurs routing is
 * short-circuited and an error RPC response is returned directly.
 */
const parseRequestFn = (): IttyHandlerFn => {
  /**
   * This itty router middleware attempts to parse the JSON body of an
   * incoming RPC request. In the case of any error it returns a
   * Response that will be returned for the route, short-circuiting any
   * further evaluation. Otherwise, it returns nothing, signalling that
   * route handling should continue.
   *
   * Note that the parsed response is added to the context as:
   *   $REQUEST_CONTEXT_KEY
   * It should be extracted from the context using that key for later
   * examination in other handlers.
   *
   * @param request a JSON-RPC HTTP Request to extract an RpcRequest from
   * @param context a map of context information
   * @return either a Response to return, or void to continue processing
   */
  return async (request: Request, context: RpcContext): IttyHandlerResult => {
    // Extract the request body as a JSON-RPC request.
    let rpcRequest: RpcRequest;
    try {
      rpcRequest = await request.json();
      // Put the parsed request into the context.
      context.set(REQUEST_CONTEXT_KEY, rpcRequest);

    } catch (error) {
      console.error(error);
      const detail = {...jsonrpc.ERROR_PARSE, data: error};
      // TODO fix, this is ugly. The passed-in request is normally used
      // to extract an ID to include in the error response, but when
      // there was no valid request found, we should be able to elide
      // the request.
      const rpcError = jsonrpc.error({
        jsonrpc: "2.0",
        method: "",
        params: {},
      }, detail);
      return jsonrpc.response(rpcError);
    }
  };
};

/**
 * Returns a middleware for the router that checks whether or not there
 * is an available handler for the requested RPC method. If the handler
 * is missing, an appropriate JSON-RPC error is returned to
 * short-circuit routing.
 *
 * @param methods A map of the available RPC methods
 * @return a router middleware
 */
const checkMethodExistsFn = (methods: RpcMethods): IttyHandlerFn => {
  /**
   * @param request
   * @param context
   */
  return async (request: Request, context: RpcContext): IttyHandlerResult => {
    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);
    const rpcMethod = Symbol.for(rpcRequest.method);
    if (!methods.has(rpcMethod)) {
      const rpcError = jsonrpc.error(rpcRequest, jsonrpc.ERROR_METHOD_NOT_FOUND);
      return jsonrpc.response(rpcError);
    }
  };
};

/**
 * Return a middleware that checks that the incoming request is valid.
 */
const checkRequestValidFn = (): IttyHandlerFn => {
  /**
   *
   */
  return async (request: Request, context: RpcContext): IttyHandlerResult => {
    // TODO
  };
};

/**
 * Return a middleware that checks that the incoming RPC request
 * parameters conform to what is described in the schema.
 */
const checkParamsValidFn = (schema: RpcSchema): IttyHandlerFn => {

  // TODO perform schema expansion, replacing all $ref by the referents.
  //const expanded = expandSchema(schema);

  // TODO generate a collection of method validators:
  // - extract the methods from the schema
  // - for each method:
  //   - construct a validator
  //   - assign to map (using same symbol key as for method handler)
  // - close over the validator map in returned middleware

  const valMap = new Map();

  //console.log(expanded);

  // FIXME each entry of schema.methods is MethodOrReference, and only Method has a name property
  /*
  for (const method of expanded.methods) {
    const methodName = Symbol.for(method.name);
    const validator = "fixme";
    valMap.set(methodName, validator);
  }
  */

  /**
   *
   */
  return async (request: Request, context: RpcContext): IttyHandlerResult => {

    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);
    // TODO extract request parameters
    // TODO extract correct validator from validator map
    // TODO perform validation, short-circuiting middleware evaluation on error
  };
};


/**
 * Return an RPC handler function that executes after all middleware
 * have completed to process the RPC request.
 */
const rpcHandlerFn = (methods: RpcMethods): IttyHandlerFn => {

  /**
   * Invoked by the router to handle a Request to the RPC endpoint.
   *
   * @param request
   * @param context
   *
   * @return A function that handles the a valid RPC request by
   * dispatching it to the appropriate service method.
   */
  return async (request: Request, context: RpcContext): IttyHandlerResult => {

    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);

    const rpcMethod = methods.get(Symbol.for(rpcRequest.method));

    // TODO move elsewhere
    const internalError: RpcHandler = (request: RpcRequest, context: RpcContext): Promise<RpcError> => {
      const errorResponse: RpcError = {
        jsonrpc: "2.0",
        id: rpcRequest.id || null,
        error: jsonrpc.ERROR_INTERNAL,
      };
      return Promise.resolve(errorResponse);
    };

    // This returns the RPC method implementation function. These return
    // a Response when invoked.
    const method = rpcMethod || internalError;
    // Generate a JSON-RPC response.
    const rpcResponse = await method(rpcRequest, context);
    // Translate JSON-RPC response into Response.
    const response = jsonrpc.response(rpcResponse);

    return response;
  }
};

/**
 * Construct a router for the RPC service. The router accepts requests
 * at rootPath and processes it through a chain of request handlers. At
 * least one of the handlers must return a Response that will be
 * returned to the caller.
 *
 * @param rootPath the URL path at which the router is based
 * @param chain a sequence of handler functions
 *
 * @return a Router instance
 */
const initRouter = (
  basePath: string,
  rootPath: string,
  schema: RpcSchema,
  methods: RpcMethods,
  chain: RpcChain,
): Router => {
  // Requests under the base path are managed by the router, by default
  // returning a 404 response. If the request happens to match the root path,
  // it is handled by the RPC request handler and the generated response is
  // returned. Note that if the base path and root path are the same, only
  // requests that match the root path are handled; a nil is returned for
  // anything else, meaning the caller has to deal with those requests.
  const router = Router({
    base: basePath,
  });

  // TODO add chain prefix that:
  // - validates incoming request against JSON-RPC schema (is this a valid JSON-RPC request?)

  // A handler that extracts an RPC request from an incoming request, if
  // possible.
  const parse = parseRequestFn();
  // A handler that checks the validity of the incoming request.
  const validRequest = checkRequestValidFn();
  // A handler that checks for the existence of a handler for the
  // incoming method.
  const methodExists = checkMethodExistsFn(methods);
  // A handler that checks whether or not the request parameters are valid.
  const validParams = checkParamsValidFn(schema);
  // The chain terminating handler that invokes the requested method to
  // generate the RPC response.
  const handler = rpcHandlerFn(methods);

  const handlerChain = _.concat(chain, [
    parse,
    validRequest,
    methodExists,
    validParams,
    handler,
  ]);

  // The router treats any handler that does *not* return as a
  // middleware; only once a handler returns is the execution chain
  // stopped and the response returned.
  router.post(rootPath, ...handlerChain);

  // Send a 404 Not Found for everything else.
  router.all('*', (request, event) => {
    return new Response("Not Found", { status: 404 })
  });

  return router;
};

// A function that takes a $ref and dereferences it to returns the result.
type LookupFn = (ref: string) => any;

// Given the value of a $ref, look up the value of the reference in
// the schema and return the result. The value of $ref is a
// URI-reference (JSON Pointer) that is resolved against the schema's
// Base URI. A JSON pointer takes the form of A # B in which: A is the
// relative path from the current schema to a target schema. If A is
// empty, the reference is to a type or property in the same schema,
// an in-schema reference.
const makeLookupFn = (schema: RpcSchema): LookupFn => {
  return (ref: string): any => {
    const parts = ref.split('/');
    assert(parts[0] === '#', 'expected a JSON Pointer for same document');
    // Drop the initial '#' and iterate over the remaining path segments.
    let cursor = schema;
    for (const part of parts.slice(1)) {
      cursor = cursor[part];
    }
    return cursor;

  };
};

/**
 * Utility method to expand an OpenRPC schema. All $ref entries in the
 * schema are replaced by the definition they refer to in the returned
 * schema.
 */
const expandSchema = (schema: RpcSchema, lookup: LookupFn): RpcSchema => {
  // TODO replace all $ref by their references.
  // TODO new type for expanded schema?
  // Every schema.method becomes MethodObject, rather than MethodOrReference

  // TODO method.params
  // TODO method.result
  // TODO just walk whole structure
  /*
  for (const k in schema) {
    if (isIterable(schema[k])) {
      return expandSchema(schema[k]);
    } else {
      // When a $ref is present it is the only key in the parent object;
      // the entire object should be replaced by the dereferenced value.
      if (k === "$ref") {
        const value = lookup(k);
        console.log(`lookup result: ${value}`);
        console.log(k, value);
        schema[k] = value;
      }
    }
  }
  */
  return schema;
};

//
// PUBLIC
//

// context
// -----------------------------------------------------------------------------

/**
 * Construct a new request context.
 */
export const context = (): RpcContext => {
  return new RpcContext();
};

// options
// -----------------------------------------------------------------------------

export const options = (opt: RpcOptions): RpcOptions => {
  return opt;
};

// chain
// -----------------------------------------------------------------------------

export const chain = (rpcChain: RpcChain): RpcChain => {
  return rpcChain;
}

// middleware
// -----------------------------------------------------------------------------

/**
 * Turn an RpcChainFn, that returns either a Response or an updated
 * Context into a handler function that implements the expected
 * behaviour of an itty handler function, i.e. returns null (to continue
 * executing) or a Response (to stop routing and return the response
 * immediately).
 */
export const middleware = (f: RpcChainFn): IttyHandlerFn => {
  // The itty router invokes treats handler functions as middleware if
  // they have no return value, but if a Response is returned it
  // short-circuits and returns the Response directly without evaluating
  // any more handlers.
  return async (request: Request, context: RpcContext): IttyHandlerResult => {
    const result = await f(request, context);
    if (result instanceof Response) {
      return Promise.resolve(result);
    }
  };
};

// methods
// -----------------------------------------------------------------------------

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
export const methods = (schema: RpcSchema, methodList: Array<RpcHandler>): RpcMethods => {
  // Construct a Map instance whose keys are Symbols derived from the
  // names of the passed in RPC method handler functions. We expect the
  // function names to align to the names defined in the OpenRPC schema.
  //
  // NB: Symbol('...') always returns a *new* Symbol even if the symbol
  // key is the same. To intern a symbol in the "global symbol table"
  // use Symbol.for('...'), which returns the unique symbol
  // corresponding to the key. Use Symbol.keyFor() to extract the symbol
  // key from a Symbol.
  const methodMap = new Map<Symbol,RpcHandler>();
  for (const methodFn of methodList) {
    const methodName = Symbol.for(methodFn.name);
    methodMap.set(methodName, methodFn);
  }

  // Extract the collection of expected method names.
  const required = new Set(_.map(schema.methods, method => Symbol.for(_.get(method, 'name'))));
  // Extract the collection of supplied method names.
  const supplied = new Set(methodMap.keys());
  // Ensure that every RPC method defined in the schema has a matching
  // handler function in the method map.
  if (!set.subset(supplied, required)) {
    const missing = set.difference(required, supplied);
    const message = _.join(_.map([...missing], Symbol.keyFor), ', ');
    throw new Error(`missing RPC methods: ${message}`);
  }

  return methodMap;
};

// handler
// -----------------------------------------------------------------------------

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
export const handler = (
  base: RpcPath,
  root: RpcPath,
  schema: RpcSchema,
  methods: RpcMethods,
  chain: RpcChain = [],
  options: RpcOptions = {},
): OpenRpcHandler => {
  // We include the service discovery method by default.
  options.rpcDiscover = (options?.rpcDiscover !== undefined) ?
    options.rpcDiscover :
    true
  ;

  // Construct URL instances for validation purposes, even though we
  // only bother with the path component of the resulting URLs.
  const ignoredBase = "https://ignore.me";

  const baseURL = new URL(base, ignoredBase);
  const basePath = baseURL.pathname;

  const rootURL = new URL(root, ignoredBase);
  const rootPath = rootURL.pathname;

  // The OpenRPC spec defines a mechanism for service discovery. The
  // request method rpc.discover is added by default and when called
  // returns an OpenRPC schema document (as JSON) for the service.
  if (options.rpcDiscover) {
    methods = addServiceDiscovery(schema, methods);
  }

  // The router handles POSTS to the rootPath by invoking an appropriate
  // method from the method map to generate the result. Everything else
  // generates a 404.
  const router = initRouter(basePath, rootPath, schema, methods, chain);

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
    return router.handle(request.clone(), context);
  };
};

// response
// -----------------------------------------------------------------------------

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

/**
 *
 */
export const error = async (request: RpcRequest, detail: RpcErrorDetail): Promise<RpcError> => {
  // TODO
  return Promise.resolve(jsonrpc.error(request, detail));
};

// method
// -----------------------------------------------------------------------------
// NB: it should work to define a "raw" method handler:
//
// const some_call = (
//   request: openrpc.RpcRequest,
//   context: openrpc.RpcContext
// ): Promise<openrpc.RpcResponse> => {}
//
// This construction results in the .name property of the function being
// 'some_call'. This property is used to align the RPC method
// implementation (this function) with the API method described in the
// OpenRPC schema for the service.
//
// Instead, we prefer to ask the user to invoke method(), passing in the
// name of the method that they are providing an implementation
// for. This allows for assignment of the result to a different variable
// name, use in a context where no assignment is occurring (such as when
// defining the method inline within a list or map of methods, but
// perhaps most importantly gives us a place to make further
// interventions in how methods are constructed in the future without
// (hopefully) breaking callers.
//
// TODO rename RpcHandler to RpcMethod?

/**
 * @param name the name of an RPC method name from your schema
 * @param f the RpcHandler function for the API method
 */
export const method = (name: string, f: RpcHandler): RpcHandler => {
  // Assign the .name property of the function object. This must align
  // with the RPC method name defined in the API schema for the method
  // to be invoked in response to a RPC request.
  return Object.defineProperty(f, 'name', {
    value: name,
    configurable: false,
    writable: false
  });
};
