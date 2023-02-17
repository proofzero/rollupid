// @kubelt/platform.edges:src/db/index.ts

/**
 * Platform edges database interface.
 */

import * as insert from './insert'
import * as remove from './remove'
import * as select from './select'
import * as update from './update'

// Imported Types
// -----------------------------------------------------------------------------

import type { AnyURN } from '@kubelt/urns'

import type {
  Edge,
  Node,
  EdgeQuery,
  EdgeRecord,
  Graph,
  EdgeDirection,
  EdgeTag,
  EdgeQueryOptions,
} from './types'

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
  return {
    db,
  }
}

// node()
// -----------------------------------------------------------------------------

/**
 * Lookup a single node in the database and return it as an object.
 */
export async function node(
  g: Graph,
  nodeId: AnyURN | undefined
): Promise<Node | undefined> {
  return select.node(g, nodeId)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that either originate or terminate at a node.
 */
export async function edges(
  g: Graph,
  query: EdgeQuery,
  opt?: EdgeQueryOptions
): Promise<Edge[]> {
  return select.edges(g, query, opt)
}

// incoming()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that terminate at a node.
 */
export async function incoming(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return select.incoming(g, nodeId)
}

// outgoing()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that originate at a node.
 */
export async function outgoing(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return select.outgoing(g, nodeId)
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
  const srcNode = await insert.node(g, src)
  // TODO check for error

  const dstNode = await insert.node(g, dst)
  // TODO check for error

  // Return existing edge ID (if found) or new edge ID (if created).
  return insert.edge(g, srcNode.urn, dstNode.urn, tag)
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
  return remove.edge(g, src, dst, tag)
}

/**
 * Update a link between two nodes.
 *
 * @param g - the graph handle returned from init()
 * @param src - the ID of the source node
 * @param dst - the ID of the destination node
 * @param tag - a tag representing the edge type
 *
 * @returns the ID of the created edge, or -1 on error
 */
export async function upsert(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<EdgeRecord> {
  const srcNode = await update.node(g, src)
  // TODO check for error

  const dstNode = await update.node(g, dst)
  // TODO check for error

  // Return existing edge ID (if found) or new edge ID (if created).
  return update.edge(g, srcNode.urn, dstNode.urn, tag)
}
