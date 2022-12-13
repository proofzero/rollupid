// @kubelt/graph:packages/graph/index.ts

/**
 * Platform graph definitions and utilities.
 */

import type { AnyURN } from '@kubelt/urns'

import { EdgeSpace } from '@kubelt/urns/edge'

import { EdgeDirection } from './types'

import * as impl from './impl/index'

// Definitions
// -----------------------------------------------------------------------------

//const NS_DO = 'durable-object'

// The URN namespace identifier for node IDs.
//const NS_NODE = 'node'

// The URN namespace identifier for
//const NS_EDGE = 'edge'

// Imported Types
// -----------------------------------------------------------------------------

import type { Edge, EdgeId, EdgeTag, Graph, Token } from './types'

// Exported Types
// -----------------------------------------------------------------------------

export type { Edge, EdgeTag, Graph }

// Exports
// -----------------------------------------------------------------------------

export { EdgeDirection, EdgeSpace }

// init()
// -----------------------------------------------------------------------------

/**
 * Create a handle for the graph database.
 */
export function init(db: D1Database): Graph {
  return impl.init(db)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that either originate or terminate at a node.
 */
export async function edges(
  g: Graph,
  nodeId: AnyURN,
): Promise<Edge[]> {
  return impl.edges(g, nodeId)
}

// incoming()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that terminate at a node.
 */
export async function incoming(
  g: Graph,
  nodeId: AnyURN,
): Promise<Edge[]> {
  return impl.incoming(g, nodeId)
}

// outgoing()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that originate at a node.
 */
export async function outgoing(
  g: Graph,
  nodeId: AnyURN,
): Promise<Edge[]> {
  return impl.outgoing(g, nodeId)
}

// link()
// -----------------------------------------------------------------------------

/**
 * Create a link between two nodes.
 *
 * @param g - the graph handle returned from init()
 * @param src - the ID of the source node
 * @param dst - the ID of the destination node
 * @param tag - a tag representing the edge type
 *
 * @returns the ID of the created edge, or -1 on error
 */
export async function link(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<EdgeId> {
  return impl.link(g, src, dst, tag)
}

// unlink()
// -----------------------------------------------------------------------------

/**
 * Remove the link between two nodes.
 *
 * @returns the number of edges removed.
 */
export async function unlink(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<number> {
  return impl.unlink(g, src, dst, tag)
}

// traversable()
// -----------------------------------------------------------------------------

/**
 * Check if a token grants permission to traverse an edge.
 */
export function traversable(graph: Graph, id: EdgeId, token: Token): boolean {
  return impl.traversable(graph, id, token)
}
