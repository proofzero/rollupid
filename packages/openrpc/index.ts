/**
 * An OpenRPC service framework for Cloudflare Workers.
 *
 * @file openrpc/index.ts
 */

import * as _ from "lodash";

import invariant from "tiny-invariant";

import type {
  RpcResult,
} from "./component/index";

import type {
  RpcClient,
  RpcClientOptions,
} from "./impl/client";

import type {
  RpcContext,
} from "./impl/context";

import type {
  OpenRpcHandler,
  RpcChain,
  RpcChainFn,
  RpcError,
  RpcErrorDetail,
  RpcHandler,
  RpcMethod,
  RpcMethodSet,
  RpcMethods,
  RpcOptions,
  RpcPath,
  RpcRequest,
  RpcResponse,
  RpcSchema,
  RpcService,
  Scope,
  ScopeSet,
  ServiceExtension,
  ServiceMethod,
} from "./impl/index";

import type {
  MiddlewareFn,
  MiddlewareResult,
} from "./impl/router";

import * as impl from "./impl/index";

// Types
// -----------------------------------------------------------------------------

export type {
  MiddlewareFn,
  MiddlewareResult,
  OpenRpcHandler,
  RpcChain,
  RpcContext,
  RpcError,
  RpcErrorDetail,
  RpcHandler,
  RpcMethod,
  RpcMethodSet,
  RpcMethods,
  RpcOptions,
  RpcPath,
  RpcRequest,
  RpcResponse,
  RpcSchema,
  RpcService,
  Scope,
  ScopeSet,
  ServiceExtension,
  ServiceMethod,
};


// -----------------------------------------------------------------------------
// PUBLIC
// -----------------------------------------------------------------------------


// context
// -----------------------------------------------------------------------------

/**
 * Construct a new request context.
 */
export function context(): RpcContext {
  return impl.context();
};

// options
// -----------------------------------------------------------------------------

/**
 *
 */
export function options(
  opt: Readonly<RpcOptions>,
): RpcOptions {
  return impl.options(opt);
};

// chain
// -----------------------------------------------------------------------------

export function chain(
  rpcChain: Readonly<RpcChain>,
): Readonly<RpcChain> {
  return impl.chain(rpcChain);
}

// middleware
// -----------------------------------------------------------------------------

/**
 * Turn an RpcChainFn that returns either a Response or an updated
 * Context into a handler function that implements the expected
 * behaviour of an itty handler function:
 * - returns null to continue executing
 * - returns a Response to stop routing and return the response
 *   immediately
 */
export function middleware(
  f: Readonly<RpcChainFn>,
): MiddlewareFn {
  return impl.middleware(f);
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
export async function response(
  request: Readonly<RpcRequest>,
  result: any,
): Promise<Readonly<RpcResponse>> {
  return impl.response(request, result);
}

// error
// -----------------------------------------------------------------------------
// TODO move to impl/response?

/**
 * @param request
 * @param detail
 *
 * @return
 */
export function error(
  request: Readonly<RpcRequest>,
  detail: Readonly<RpcErrorDetail>,
): Promise<Readonly<RpcError>> {
  return impl.error(request, detail);
};

// methods
// -----------------------------------------------------------------------------
// NB: Symbol('...') always returns a *new* Symbol even if the symbol
// key is the same. To intern a symbol in the "global symbol table" use
// Symbol.for('...'), which returns the unique symbol corresponding to
// the key. Use Symbol.keyFor() to extract the symbol key from a Symbol.

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
export function methods(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>,
): Readonly<RpcMethods> {
  return impl.methods(schema, methodSet);
};

// method
// -----------------------------------------------------------------------------

/**
 *
 */
export function method(
  schema: Readonly<RpcSchema>,
  serviceMethod: Readonly<ServiceMethod>,
): Readonly<RpcMethod> {
  return impl.method(schema, serviceMethod);
}

// handler
// -----------------------------------------------------------------------------

/**
 * @param f An RPC method handler function
 * @param target The element to bind as "this" inside the handler
 */
export function handler(
  f: Readonly<RpcHandler>,
): Readonly<RpcHandler> {
  return impl.handler(f);
}

// extensions
// -----------------------------------------------------------------------------

/**
 * @param schema
 * @param methodSet
 * @return
 */
export function extensions(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>,
): Readonly<RpcMethods> {
  return impl.extensions(schema, methodSet);
}

// extension
// -----------------------------------------------------------------------------

/**
 * @param schema
 * @param ext
 * @return
 */
export function extension(
  schema: Readonly<RpcSchema>,
  ext: Readonly<ServiceExtension>,
): Readonly<RpcMethod> {
  return impl.extension(schema, ext);
}

// extend
// -----------------------------------------------------------------------------

/**
 * Extend a service with a method that isn't defined in the schema.
 *
 * @param service
 * @param method
 */
function extend(
  service: Readonly<RpcService>,
  method: Readonly<RpcMethod>,
): Readonly<RpcService> {
  return impl.extend(service, method);
}

// scope
// -----------------------------------------------------------------------------

/**
 * @param name
 * @return
 */
export function scope(
  name: string | Scope,
): Scope {
  return impl.scope(name);
}

// scopes
// -----------------------------------------------------------------------------

/**
 * @param list
 * @return
 */
export function scopes(
  list: ReadonlyArray<string|Scope>,
): Readonly<ScopeSet> {
  return impl.scopes(list);
}

// service
// -----------------------------------------------------------------------------

/**
 * @param schema
 * @param allScopes
 * @param methods
 * @param extensions
 * @param clientOptions
 * @return
 */
export function service(
  schema: Readonly<RpcSchema>,
  allScopes: Readonly<ScopeSet>,
  methods: Readonly<RpcMethods>,
  extensions: Readonly<RpcMethods>,
  clientOptions: Readonly<RpcOptions>,
): Readonly<RpcService> {
  return impl.service(
    schema,
    allScopes,
    methods,
    extensions,
    clientOptions,
  );
}

// build
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
export function build(
  service: Readonly<RpcService>,
  base: Readonly<RpcPath>,
  root: Readonly<RpcPath>,
  chain: Readonly<RpcChain> = [],
): OpenRpcHandler {
  return impl.build(
    service,
    base,
    root,
    chain,
  );
}

// client
// -----------------------------------------------------------------------------

/**
 * @param durableObject
 * @param name
 * @param schema
 * @param options
 * @return
 */
export function client(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  schema: RpcSchema,
  options: RpcClientOptions = {},
): RpcClient {
  return impl.client(
    durableObject,
    name,
    schema,
    options,
  );
}

// discover
// -----------------------------------------------------------------------------

/**
 * @param durableObject
 * @param name
 * @param options
 *
 * @return an RPC client stub for the discovered OpenRPC service
 */
export async function discover(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  options: RpcClientOptions = {},
): Promise<RpcClient> {
  return impl.discover(
    durableObject,
    name,
    options,
  );
}
