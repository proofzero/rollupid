/**
 * @file router.ts
 */

import * as _ from "lodash";

import { Router } from "itty-router";

import { /*error,*/ status } from "itty-router-extras";

import * as jsonrpc from "./jsonrpc";
import * as schema from "./schema";

import type {
  JsonRpcError
} from "./jsonrpc";

import type {
  RpcChain,
  RpcContext,
  RpcError,
  RpcHandler,
  RpcMethods,
  RpcRequest,
  RpcSchema,
  RpcService,
} from "../index";

// Definitions
// -----------------------------------------------------------------------------

import {
  REQUEST_CONTEXT_KEY,
} from "../constants";

// Types
// -----------------------------------------------------------------------------
// TODO create an additional type representing a "chain terminator" that
// *must* return a response. This should be the type of the last handler
// in the routing chain and must be a narrowed version of
// IttyHandlerResult that removes the void response option.

export type MiddlewareResult = Promise<Response|void>;

export type MiddlewareFn = (request: Request, context: RpcContext) => MiddlewareResult;

// parseRequestFn
// -----------------------------------------------------------------------------

/**
 * Return a middleware that extracts the JSON body of a request and
 * converts it into an OpenRpc request. If an error occurs routing is
 * short-circuited and an error RPC response is returned directly.
 */
function parseRequestFn(): MiddlewareFn {
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
  return async (request: Request, context: RpcContext): MiddlewareResult => {
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

// checkRequestValidFn
// -----------------------------------------------------------------------------

/**
 * Return a middleware that checks that the incoming request is valid.
 */
function checkRequestValidFn(): MiddlewareFn {
  /**
   *
   */
  return async (request: Request, context: RpcContext): MiddlewareResult => {
    // TODO
  };
};

// checkMethodExistsFn
// -----------------------------------------------------------------------------

/**
 * Returns a middleware for the router that checks whether or not there
 * is an available handler for the requested RPC method. If the handler
 * is missing, an appropriate JSON-RPC error is returned to
 * short-circuit routing.
 *
 * @param methods A map of the available RPC methods
 * @return a router middleware
 */
const checkMethodExistsFn = (methods: RpcMethods): MiddlewareFn => {
  /**
   * @param request
   * @param context
   */
  return async (request: Request, context: RpcContext): MiddlewareResult => {
    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);
    const rpcMethod = Symbol.for(rpcRequest.method.trim());
    if (!methods.has(rpcMethod)) {
      const rpcError = jsonrpc.error(rpcRequest, jsonrpc.ERROR_METHOD_NOT_FOUND);
      return jsonrpc.response(rpcError);
    }
  };
};

// checkParamsValidFn
// -----------------------------------------------------------------------------

/**
 * Return a middleware that checks that the incoming RPC request
 * parameters conform to what is described in the schema.
 */
function checkParamsValidFn(schema: RpcSchema): MiddlewareFn {

  // TODO perform schema expansion, replacing all $ref by the referents.
  //const expanded = schema.expand(schema);

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
  return async (request: Request, context: RpcContext): MiddlewareResult => {

    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);
    // TODO extract request parameters
    // TODO extract correct validator from validator map
    // TODO perform validation, short-circuiting middleware evaluation on error
  };
};

// rpcHandlerFn
// -----------------------------------------------------------------------------

/**
 * Return an RPC handler function that executes after all middleware
 * have completed to process the RPC request.
 */
function rpcHandlerFn(methods: RpcMethods): MiddlewareFn {

  // Is there a better place for this?
  function errorHandler(error: JsonRpcError): RpcHandler {
    return (request: RpcRequest, context: RpcContext): Promise<RpcError> => {
      return Promise.resolve(jsonrpc.error(request, error));
    };
  }

  const internalError = errorHandler(jsonrpc.ERROR_INTERNAL);
  const notFoundError = errorHandler(jsonrpc.ERROR_METHOD_NOT_FOUND);

  /**
   * Invoked by the router to handle a Request to the RPC endpoint.
   *
   * @param request
   * @param context
   *
   * @return A function that handles the a valid RPC request by
   * dispatching it to the appropriate service method.
   */
  return async (request: Request, context: RpcContext): MiddlewareResult => {

    const rpcRequest = context.get(REQUEST_CONTEXT_KEY);

    const rpcMethod = methods.get(Symbol.for(rpcRequest.method));

    // This returns the RPC method implementation function. These return
    // a Response when invoked.
    const handler = ( undefined === rpcMethod ) ?
      notFoundError :
      ( rpcMethod?.handler || internalError );
    // Generate a JSON-RPC response.
    const rpcResponse = await handler(rpcRequest, context);
    // Translate JSON-RPC response into Response.
    const response = jsonrpc.response(rpcResponse);

    return response;
  }

};

// init
// -----------------------------------------------------------------------------

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
export function init(
  service: RpcService,
  basePath: string,
  rootPath: string,
  chain: RpcChain,
): Router {
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
  const methodExists = checkMethodExistsFn(service.methods);
  // A handler that checks whether or not the request parameters are valid.
  const validParams = checkParamsValidFn(service.schema);
  // The chain terminating handler that invokes the requested method to
  // generate the RPC response.
  const handler = rpcHandlerFn(service.methods);

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
