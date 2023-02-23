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
  EdgeQueryResults,
} from './types'
import { parseUrnForEdge } from '@kubelt/urns/edge'

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
): Promise<EdgeQueryResults> {
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
 * @returns the ID of the created edge, or -1 on error
 */
export async function link(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<void> {
  const batchedStmnts: D1PreparedStatement[] = []
  const parsedSrcNode = parseUrnForEdge(src)
  const srcNodeStmts = insert.node(g, parsedSrcNode)
  // TODO check for error

  const parsedDstNode = parseUrnForEdge(dst)
  const dstNodeStmts = insert.node(g, parsedDstNode)
  // TODO check for error

  // Return existing edge ID (if found) or new edge ID (if created).
  const edgeStmt = insert.edge(g, parsedSrcNode, parsedDstNode, tag)

  batchedStmnts.concat(srcNodeStmts)
  batchedStmnts.concat(dstNodeStmts)
  batchedStmnts.push(edgeStmt)

  await g.db.batch(batchedStmnts)
  return
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
): Promise<void> {
  await remove.edge(g, src, dst, tag).run()
  return
}

/**
 * Update a link between two nodes.
 * @returns the ID of the created edge, or -1 on error
 */
export async function upsert(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<void> {
  const batchedStmnts: D1PreparedStatement[] = []
  const parsedSrcNode = parseUrnForEdge(src)
  const srcNodeStmts = update.node(g, parsedSrcNode)
  // TODO check for error

  const parsedDstNode = parseUrnForEdge(dst)
  const dstNodeStmts = update.node(g, parsedDstNode)
  // TODO check for error

  // Return existing edge ID (if found) or new edge ID (if created).
  const edgeStmt = update.edge(g, parsedSrcNode, parsedDstNode, tag)

  batchedStmnts.concat(srcNodeStmts)
  batchedStmnts.concat(dstNodeStmts)
  batchedStmnts.push(edgeStmt)

  await g.db.batch(batchedStmnts)
  return
}

/**
 * Update a links between two nodes.
 * @returns the ID of the created edge, or -1 on error
 */
export async function batchUpsert(
  g: Graph,
  edges: {
    src: AnyURN
    dst: AnyURN
    tag: EdgeTag
  }[]
): Promise<void> {
  const batchedStmnts: D1PreparedStatement[] = []
  edges.map((edge) => {
    const parsedSrcNode = parseUrnForEdge(edge.src)
    const srcNodeStmts = update.node(g, parsedSrcNode)
    // TODO check for error

    const parsedDstNode = parseUrnForEdge(edge.dst)
    const dstNodeStmts = update.node(g, parsedDstNode)
    // TODO check for error

    // Return existing edge ID (if found) or new edge ID (if created).
    const edgeStmt = update.edge(g, parsedSrcNode, parsedDstNode, edge.tag)

    batchedStmnts.concat(srcNodeStmts)
    batchedStmnts.concat(dstNodeStmts)
    batchedStmnts.push(edgeStmt)
  })

  await g.db.batch(batchedStmnts)
  // TODO check for error
  return
}
