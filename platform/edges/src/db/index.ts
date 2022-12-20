// @kubelt/platform.edges:src/db/index.ts

/**
 * Platform edges database interface.
 */

import { EdgeDirection } from '@kubelt/graph'

import * as impl from './impl/index'

// Imported Types
// -----------------------------------------------------------------------------

import type { AnyURN } from '@kubelt/urns'

import type { Edge, EdgeTag, EdgeQuery, EdgesOptions, Node } from '@kubelt/graph'

import type { EdgeRecord, EdgeId, Graph, NodeRecord, Token } from './types'

// Exported Types
// -----------------------------------------------------------------------------

export type { EdgeTag, Graph }

// Exports
// -----------------------------------------------------------------------------

export { EdgeDirection }

// init()
// -----------------------------------------------------------------------------

/**
 * Create a handle for the graph database.
 */
export function init(db: D1Database): Graph {
  return impl.init(db)
}

// node()
// -----------------------------------------------------------------------------

/**
 * Lookup a single node in the database and return it as an object.
 */
export async function node(
  g: Graph,
  nodeId: AnyURN|undefined
): Promise<Node|undefined> {
  return impl.node(g, nodeId)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that either originate or terminate at a node.
 */
export async function edges(
  g: Graph,
  query: EdgeQuery,
  opt?: EdgesOptions,
): Promise<Edge[]> {
  return impl.edges(g, query, opt)
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
): Promise<EdgeRecord> {
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
