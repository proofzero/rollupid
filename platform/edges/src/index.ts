// @kubelt/platform.edges:/src/index.ts

/**
 * This Cloudflare worker is for experimenting with the graph "edges"
 * database.
 *
 * @packageDocumentation
 */

import * as _ from 'lodash'

import * as openrpc from '@kubelt/openrpc'

import * as urns from 'urns'

import type {
  RpcContext,
  RpcRequest,
  RpcService,
} from '@kubelt/openrpc'

import { default as mwOnlyLocal } from '@kubelt/openrpc/middleware/local'

import type { EdgeTag, Graph } from '@kubelt/graph'

import { EdgeDirection } from '@kubelt/graph'

import * as graph from '@kubelt/graph'

// Schema
// -----------------------------------------------------------------------------

// Import the OpenRPC schema for this API.
import schema from './schema'

// Definitions
// -----------------------------------------------------------------------------

// Context key for a KV value containing name of current environment.
const KEY_ENVIRONMENT = 'com.kubelt.value/environment'

// Context key for a graph handle.
const KEY_GRAPH = 'com.kubelt.handle/graph'

// Scopes
// -----------------------------------------------------------------------------
// This service doesn't use scopes, we can use this everywhere a set of scopes
// are required.

const noScope = openrpc.scopes([])

// Error Codes
// -----------------------------------------------------------------------------

const ErrorMissingSourceNode = {
  code: 1,
  message: 'missing source node URN',
}

const ErrorInvalidSourceNode = {
  code: 2,
  message: 'invalid source node URN',
}

const ErrorMissingDestinationNode = {
  code: 3,
  message: 'missing destination node URN',
}

const ErrorInvalidDestinationNode = {
  code: 4,
  message: 'invalid destination node URN',
}

// Methods
// -----------------------------------------------------------------------------
// These are the method handler implementations for the RPC methods
// defined in the OpenRPC API schema.

// NB: we are not yet validating the incoming RPC request against the schema!

// kb_makeEdge
// -----------------------------------------------------------------------------

/**
 * Implement the kb_makeEdge schema method to create a new edge between
 * components.
 */
const kb_makeEdge = openrpc.method(schema, {
  name: 'kb_makeEdge',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const g: Graph = context.get(KEY_GRAPH)

      // TODO schema enforcement required

      // SRC

      const srcId = _.get(request, ['params', 'src'])
      if (_.isUndefined(srcId)) {
        return openrpc.error(request, ErrorMissingSourceNode)
      }
      let parsedSrcUrn: urns.ParsedURN
      let srcURN: string
      try {
        parsedSrcUrn = urns.parseURN(srcId)
        srcURN = `urn:${parsedSrcUrn.nid}:${parsedSrcUrn.nss}`
      } catch (e) {
        return openrpc.error(request, ErrorInvalidSourceNode)
      }

      // DST

      const dstId = _.get(request, ['params', 'dst'])
      if (_.isUndefined(dstId)) {
        return openrpc.error(request, ErrorMissingDestinationNode)
      }
      let dstURN: urns.ParsedURN
      try {
        dstURN = urns.parseURN(dstId)
      } catch (e) {
        return openrpc.error(request, ErrorInvalidDestinationNode)
      }

      // TAG

      const edgeTag = _.get(request, ['params', 'tag'])
      if (edgeTag === undefined) {
        return openrpc.error(request, { code: 4, message: 'missing edge tag' })
      }

      // TODO add urn: option to client:
      // - urn:durable-object:<xxx>
      // - urn:threeid:...

      const tag: EdgeTag = graph.edge(edgeTag)

      const edgeId = await graph.link(g, srcId, dstId, tag)

      // TODO permissions

      console.log(`created edge ${edgeId}: ${srcURN} =[${tag}]=> ${dstURN}`)

      return openrpc.response(request, {
        edge: {
          id: edgeId,
          src: srcURN,
          dst: dstURN,
          tag,
        },
      })
    }
  ),
})

// kb_getEdges
// -----------------------------------------------------------------------------

const kb_getEdges = openrpc.method(schema, {
  name: 'kb_getEdges',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const g: Graph = context.get(KEY_GRAPH)

      const nodeId = _.get(request, ['params', 'id'])
      if (_.isUndefined(nodeId)) {
        return openrpc.error(request, {
          code: 1,
          message: 'missing node URN',
        })
      }
      try {
        urns.parseURN(nodeId)
      } catch (e) {
        return openrpc.error(request, {
          code: 2,
          message: 'invalid node URN',
        })
      }

      // Check for optional restriction to either 'incoming' or 'outgoing' edges.
      const edgeDir: EdgeDirection = _.get(request, ['params', 'direction'])

      let edges

      if (edgeDir !== undefined) {
        switch (edgeDir) {
          case EdgeDirection.Incoming:
            edges = await graph.incoming(g, nodeId)
            console.log(edges)
            break
          case EdgeDirection.Outgoing:
            edges = await graph.outgoing(g, nodeId)
            console.log(edges)
            break
          default:
            throw new Error(`invalid edge direction: ${edgeDir}`)
        }
      } else {
        // Get the list of all edges impinging on a node (either incoming
        // or outgoing).
        edges = await graph.edges(g, nodeId)
      }

      return openrpc.response(request, {
        id: nodeId,
        edges,
      })
    }
  ),
})

// kb_rmEdge
// -----------------------------------------------------------------------------

const kb_rmEdge = openrpc.method(schema, {
  name: 'kb_rmEdge',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const g: Graph = context.get(KEY_GRAPH)

      // SRC

      const srcId = _.get(request, ['params', 'src'])
      if (_.isUndefined(srcId)) {
        return openrpc.error(request, {
          code: 1,
          message: 'missing source node URN',
        })
      }
      try {
        urns.parseURN(srcId)
      } catch (e) {
        return openrpc.error(request, {
          code: 2,
          message: 'invalid source node URN',
        })
      }

      // DST

      const dstId = _.get(request, ['params', 'dst'])
      if (_.isUndefined(dstId)) {
        return openrpc.error(request, {
          code: 3,
          message: 'missing destination node URN',
        })
      }
      try {
        urns.parseURN(dstId)
      } catch (e) {
        return openrpc.error(request, {
          code: 4,
          message: 'invalid destination node URN',
        })
      }

      // TAG

      const edgeTag = _.get(request, ['params', 'tag'])
      if (edgeTag === undefined) {
        return openrpc.error(request, { code: 4, message: 'missing edge tag' })
      }

      // Unlink the edge (if it exists).
      const edgeId = await graph.unlink(g, srcId, dstId, edgeTag)

      return openrpc.response(request, {
        removed: edgeId,
      })
    }
  ),
})

// kb_findNode
// -----------------------------------------------------------------------------

const kb_findNode = openrpc.method(schema, {
  name: 'kb_findNode',
  scopes: noScope,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>,
    ) => {
      const g: Graph = context.get(KEY_GRAPH)

      // TODO find node(s) by:
      // - nid: direct match
      // - nss: direct match
      // - f
      // - qc
      // - rc
      // TODO support pagination

      /*
      const edges = graph.find('node', {
        equals: {
          nid,
          nss,
        },
        contains: {
          rcomp: 'foo',
        }
      })
      */

      return openrpc.response(request, {
        warn: 'not yet implemented',
        results: [],
      })
    }
  ),
})

// Service
// -----------------------------------------------------------------------------
// Define an OpenRPC service.

// This service doesn't current require scopes to invoke RPC methods.
const scopes = noScope

// These are the implementations of the RPC methods described in the schema.
const methods = openrpc.methods(schema, [
  kb_findNode,
  kb_getEdges,
  kb_makeEdge,
  kb_rmEdge,
])

// These are RPC methods not described in the schema but which are provided
// by the service.
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
// to the incoming request, e.g. if authentication fails.
const chain = openrpc.chain([
  // This middleware rejects any requests that don't originate at
  // localhost.
  mwOnlyLocal,
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

  // D1 Databases
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/d1/

  EDGES: D1Database

  // Buckets
  // ---------------------------------------------------------------------------
  // Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/

  // The bucket where application icons are stored.
  //ICON_BUCKET: R2Bucket;

  // Service bindings
  // ---------------------------------------------------------------------------

  // Environment variables
  // ---------------------------------------------------------------------------

  // The name of the current deployment environment.
  ENVIRONMENT: string

  // Secrets
  // ---------------------------------------------------------------------------
}

// Worker
// -----------------------------------------------------------------------------

/**
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

    // Store the current environment name, e.g. local, dev.
    context.set(KEY_ENVIRONMENT, env.ENVIRONMENT)
    // Construct and store our graph handle.
    const g = graph.init(env.EDGES)
    context.set(KEY_GRAPH, g)

    // NB: the handler clones the request; we don't need to do it here.
    return rpcHandler(request, context)
  },
}
