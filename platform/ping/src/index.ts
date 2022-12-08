// platform/ping:src/index.ts
/**
 * This Cloudflare worker provides an example OpenRPC ping service.
 *
 * @packageDocumentation
 */

import * as _ from 'lodash'

import * as openrpc from '@kubelt/openrpc'

import invariant from 'tiny-invariant'

import type {
  RpcAuthHandler,
  RpcContext,
  RpcRequest,
  RpcService,
} from '@kubelt/openrpc'

import { default as mwGeolocation } from '@kubelt/openrpc/middleware/geolocation'

import { ReplyMessage } from './node/reply'

import { KEY_REQUEST_ENV } from '@kubelt/openrpc/constants'

import type { Scope } from '@kubelt/security/scopes'

import { SCOPES_JSON } from '@kubelt/security/scopes'

// Schema
// -----------------------------------------------------------------------------

// Import the OpenRPC schema for this API.
import schema from './schema'

// Durable Objects
// -----------------------------------------------------------------------------
// We need to export any Durable Objects we use.

export { ReplyMessage }

// Definitions
// -----------------------------------------------------------------------------

// Context key for looking up ExampleObject durable object.
const KEY_REPLY_MESSAGE = 'com.kubelt.object/reply-message'

// Scopes
// -----------------------------------------------------------------------------
// This service doesn't use scopes, we can use this everywhere a set of scopes
// are required.

const noScope = openrpc.scopes([])

// Methods
// -----------------------------------------------------------------------------
// These are the method handler implementations for the RPC methods
// defined in the OpenRPC API schema.

// NB: we are not yet validating the incoming RPC request against the schema!

// kb_init
// -----------------------------------------------------------------------------

/**
 * Update the message returned for PING requests.
 */
const kb_init = openrpc.method(schema, {
  name: 'kb_init',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const replyMessage: DurableObjectNamespace =
        context.get(KEY_REPLY_MESSAGE)

      const message = _.get(request, ['params', 'message'])

      // Get a client for the component that stores the PING reply
      // message.
      const ex = await openrpc.discover(replyMessage, {
        name: 'ping',
      })
      await ex.init({ message })

      return openrpc.response(request, {
        message,
      })
    }
  ),
})

// kb_delayInit
// -----------------------------------------------------------------------------

const kb_delayInit = openrpc.method(schema, {
  name: 'kb_delayInit',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const replyMessage: DurableObjectNamespace =
        context.get(KEY_REPLY_MESSAGE)

      // Get the time delay to wait before updating the message.
      const delay = _.get(request, ['params', 'delay'])
      const message = _.get(request, ['params', 'message'])

      const ex = await openrpc.discover(replyMessage, {
        name: 'ping',
      })
      const result = await ex.schedule({
        message,
        delay,
      })

      return openrpc.response(request, result)
    }
  ),
})

// kb_ping
// -----------------------------------------------------------------------------

/**
 * Reply to a PING message with a PONG response.
 */
const kb_ping = openrpc.method(schema, {
  name: 'kb_ping',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const replyMessage: DurableObjectNamespace =
        context.get(KEY_REPLY_MESSAGE)

      // Construct a client for the ReplyMessage component.
      const ex = await openrpc.discover(replyMessage, {
        name: 'ping',
      })
      const message = await ex.message()

      return openrpc.response(request, {
        message,
      })
    }
  ),
})

// kb_pong
// -----------------------------------------------------------------------------

const kb_pong = openrpc.method(schema, {
  name: 'kb_pong',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const exampleObject: DurableObjectNamespace =
        context.get(KEY_EXAMPLE_OBJECT)

      throw 'cannot pong'
    }
  ),
})

// Service
// -----------------------------------------------------------------------------
// Define an OpenRPC service.

// This service doesn't current require scopes to invoke RPC methods.
const scopes = noScope

// These are the implementations of the RPC methods described in the
// schema.
const methods = openrpc.methods(schema, [
  kb_delayInit,
  kb_init,
  kb_ping,
  kb_pong,
])

// These are RPC methods not described in the schema but which are
// provided by the service.
const extensions = openrpc.extensions(schema, [])

// Configuration options for the API.
const options = openrpc.options({
  // Enable OpenRPC service discovery.
  rpcDiscover: true,
})

// Supply implementations for all of the API methods in the schema.
const service = openrpc.service(schema, scopes, methods, extensions, options)

// Handler
// -----------------------------------------------------------------------------
// A handler is a function that accepts a JSON-RPC request and returns a JSON-RPC
// response. It deals with the machinery involved is mounting a service at a
// particular path, invokes middleware on the incoming request, and ultimately
// dispatches the request to the correct RPC service method.

// All requests whose path is "under" this location are handled by
// returning a 404 *unless* the request happens to be the root path.
// If the base path is the same as the root path, you will need to handle
// any request that isn't to the root path yourself.
const basePath = '/'

// The RPC resource endpoint; requests to this path are handled as RPC requests.
const rootPath = '/jsonrpc'

// Construct a sequence of middleware to execute before any RPC methods
// are invoked. These may short-circuit, directly returning a response
// to the incoming request.
const chain = openrpc.chain([
  // Extra geolocation data provided by Cloudflare.
  mwGeolocation,
])

// The returned handler validates the incoming request, routes it to the
// correct method handler, and executes the handler on the request to
// generate the response.
const rpcHandler = openrpc.build(service, basePath, rootPath, chain)

// Environment
// -----------------------------------------------------------------------------
// Describe the expected shape of the Cloudflare-provided environment.

export interface Env {
  // KV Namespaces
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/

  // Durable Objects
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/

  // A component representing a single Starbase application. This includes an OAuth
  // configuration profile and other metadata about the application.
  REPLY_MESSAGE: ReplyMessage

  // Buckets
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/

  // Service bindings
  // ---------------------------------------------------------------------------

  // Environment variables
  // ---------------------------------------------------------------------------

  // Secrets
  // ---------------------------------------------------------------------------
}

// Worker
// -----------------------------------------------------------------------------

/**
 * Entry point for requests to the worker.
 *
 * @param request - A Request instance containing the request to handle.
 * @param env - An object containing environment bindings.
 * @param ctx - A request execution context.
 *
 * @returns An HTTP response.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const context = openrpc.context(request, env, ctx)

    // A durable object containing Starbase App state.
    context.set(KEY_REPLY_MESSAGE, env.REPLY_MESSAGE)

    // NB: the handler clones the request; we don't need to do it here.
    return rpcHandler(request, context)
  },
}
