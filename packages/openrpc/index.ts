// @kubelt/openrpc:index.ts

/**
 * An OpenRPC service framework for Cloudflare Workers.
 */

import invariant from 'tiny-invariant'

import type { RpcClient, RpcClientOptions } from './impl/client'

import type { RpcContext } from './impl/context'

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
} from './impl/index'

import type { MiddlewareFn, MiddlewareResult } from './impl/router'

import * as impl from './impl/index'

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
}

// -----------------------------------------------------------------------------
// PUBLIC
// -----------------------------------------------------------------------------

// context
// -----------------------------------------------------------------------------

/**
 * Construct a new request context.
 */
export function context(): RpcContext {
  return impl.context()
}

// options
// -----------------------------------------------------------------------------

/**
 *
 */
export function options(opt: Readonly<RpcOptions>): RpcOptions {
  return impl.options(opt)
}

// chain
// -----------------------------------------------------------------------------

export function chain(rpcChain: Readonly<RpcChain>): Readonly<RpcChain> {
  return impl.chain(rpcChain)
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
 *
 * @param f - A function that implements the middleware logic
 *
 * @returns
 */
export function middleware(f: Readonly<RpcChainFn>): MiddlewareFn {
  return impl.middleware(f)
}

// response
// -----------------------------------------------------------------------------

/**
 * Return an RPC response for a given request. The result to include in
 * the response must be supplied and will be included in the returned
 * response.
 *
 * @param request - The request that is being responded to
 * @param result - A value to send as the result of the RPC call
 *
 * @returns A JSON-RPC response that returns the supplied result to the
 * caller.
 */
export async function response(
  request: Readonly<RpcRequest>,
  result: unknown
): Promise<Readonly<RpcResponse>> {
  return impl.response(request, result)
}

// error
// -----------------------------------------------------------------------------

/**
 * Return a JSON-RPC error response for a given request.
 *
 * @param request - A JSON-RPC request to return an error for
 * @param detail - Information about the error that occurred
 *
 * @returns A JSON-RPC error response
 */
export function error(
  request: Readonly<RpcRequest>,
  detail: Readonly<RpcErrorDetail>
): Promise<Readonly<RpcError>> {
  return impl.error(request, detail)
}

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
 * @param schema - An OpenRPC schema defining the API
 * @param methodList - An array of RPC request method implementations
 *
 * @returns A map from method name to method implementation
 */
export function methods(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>
): Readonly<RpcMethods> {
  return impl.methods(schema, methodSet)
}

// method
// -----------------------------------------------------------------------------

/**
 * Returns an RPC method that implments one of the calls in the provided
 * schema.
 *
 * @param schema - the RPC schema where the method is declared
 * @param serviceMethod - a descriptor for the service method
 *
 * @returns An RPC method that can be passed to methods()
 */
export function method(
  schema: Readonly<RpcSchema>,
  serviceMethod: Readonly<ServiceMethod>
): Readonly<RpcMethod> {
  return impl.method(schema, serviceMethod)
}

// handler
// -----------------------------------------------------------------------------

/**
 * @param f - An RPC method handler function
 */
export function handler(f: Readonly<RpcHandler>): Readonly<RpcHandler> {
  return impl.handler(f)
}

// extensions
// -----------------------------------------------------------------------------

/**
 * Returns a map from RPC extension name to implementation. The return
 * value can be supplied to `build()` to define the collection of
 * extensions that are included in the OpenRPC service.
 *
 * @remarks
 *
 * An extension is not declared in the OpenRPC schema for this service,
 * unlike a "method".
 *
 * @param schema - An OpenRPC method descriptor (`MethodObject`)
 * @param methodSet - A collection of extensions built using `extension()`
 *
 * @returns A collection of service extensions.
 */
export function extensions(
  schema: Readonly<RpcSchema>,
  methodSet: Readonly<RpcMethodSet>
): Readonly<RpcMethods> {
  return impl.extensions(schema, methodSet)
}

// extension
// -----------------------------------------------------------------------------

/**
 * Define an OpenRPC service method that isn't described in the schema
 * for the service. It's necessary to provide a descriptor for the
 * method since it won't be found in the schema itself.
 *
 * @remarks
 *
 * An extension is not declared in the OpenRPC schema for this service,
 * unlike a "method".
 *
 * @param schema - An OpenRPC method descriptor (`MethodObject`)
 * @param ext - a descriptor for the service extensionx
 *
 * @returns An RPC extension that can be passed to `extensions()`
 */
export function extension(
  schema: Readonly<RpcSchema>,
  ext: Readonly<ServiceExtension>
): Readonly<RpcMethod> {
  return impl.extension(schema, ext)
}

// extend
// -----------------------------------------------------------------------------

/**
 * Extend a service with a method that isn't defined in the schema.
 *
 * @param service - the RPC service to extend with a new extension
 * @param extension - an extension to add to the service
 *
 * @returns The updated RPC service
 */
export function extend(
  service: Readonly<RpcService>,
  extension: Readonly<RpcMethod>
): Readonly<RpcService> {
  return impl.extend(service, extension)
}

// scope
// -----------------------------------------------------------------------------

/**
 * Creates a scope with the given name. Scopes are used to control
 * access to resources, e.g. to invoke component methods and must be
 * provided by callers in a verifiable way for access to be granted.
 *
 * @param name - the name of the scope to create
 *
 * @returns A new scope.
 */
export function scope(name: string | Scope): Scope {
  invariant(name !== '')

  return impl.scope(name)
}

// scopes
// -----------------------------------------------------------------------------

/**
 * Return a collection of scopes.
 *
 * @param list - An array of scopes or scope names
 *
 * @returns A collection of scopes
 */
export function scopes(
  list: ReadonlyArray<string | Scope>
): Readonly<ScopeSet> {
  return impl.scopes(list)
}

// service
// -----------------------------------------------------------------------------

/**
 * Return an OpenRPC service descriptor. This descriptor can be
 * transformed into an executable format by calling `build()`.
 *
 * @param schema - An OpenRPC schema that describes the service
 * @param allScopes - A collection of all scopes used by the service
 * @param methods - The service methods described in the schema
 * @param extensions - Any extra service methods not described in the schema
 * @param clientOptions - Various configuration options
 *
 * @returns A descriptor for the OpenRPC service.
 */
export function service(
  schema: Readonly<RpcSchema>,
  allScopes: Readonly<ScopeSet>,
  methods: Readonly<RpcMethods>,
  extensions: Readonly<RpcMethods>,
  clientOptions: Readonly<RpcOptions>
): Readonly<RpcService> {
  return impl.service(schema, allScopes, methods, extensions, clientOptions)
}

// build
// -----------------------------------------------------------------------------

/**
 * Construct an RPC request handler function.
 *
 * @param path - The root path for the API
 * @param schema - The OpenRPC schema for the API
 * @param methods - A collection of RPC method implementations
 * @param chain - A sequence of middleware functions to execute
 * @param options - Configuration options for the API
 *
 * @returns A function that should be invoked on an incoming Request
 * (optionally including an additional context Map), and which returns
 * an HTTP Response object.
 */
export function build(
  service: Readonly<RpcService>,
  base: Readonly<RpcPath>,
  root: Readonly<RpcPath>,
  chain: Readonly<RpcChain> = []
): OpenRpcHandler {
  return impl.build(service, base, root, chain)
}

// client
// -----------------------------------------------------------------------------
// TODO this should be extended to allow for the creation of clients for
// non-component-based services, but for now we mainly care about
// talking to components.

/**
 * Construct a client for a durable object "component" implementing an
 * OpenRPC service described by a schema.
 *
 * @param durableObject - The durable object that provides the component implementation
 * @param name - The unique identifier of the durable object.
 * @param schema - The OpenRPC schema for the component service
 * @param options - Configuration options for the client
 *
 * @returns A client for the component service.
 */
export function client(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  schema: RpcSchema,
  options: RpcClientOptions = {}
): RpcClient {
  return impl.client(durableObject, name, schema, options)
}

// discover
// -----------------------------------------------------------------------------
// TODO allow client construction using the service URL

/**
 * Calls rpc.discover on the component defined by the given durable
 * object, with unique instance ID provided by `name`.
 *
 * @param durableObject - The durable object that provides the component implementation
 * @param name - The unique identifier of the durable object.
 * @param options - Configuration options for the client
 *
 * @returns an RPC client stub for the discovered OpenRPC service
 */
export async function discover(
  // TODO better type?
  durableObject: DurableObjectNamespace,
  name: string,
  options: RpcClientOptions = {}
): Promise<RpcClient> {
  return impl.discover(durableObject, name, options)
}
