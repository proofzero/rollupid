// @kubelt/platform.edges:src/db/index.ts

/**
 * Platform edges database interface.
 */

import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'

import * as impl from './impl/index'

// Imported Types
// -----------------------------------------------------------------------------

import type { AnyURN } from '@kubelt/urns'

import type {
  Edge,
  Node,
  EdgeQuery,
  EdgeRecord,
  EdgeId,
  NodeRecord,
  Token,
  EdgeDirection,
  EdgeTag,
} from './types'

// Exported Types
// -----------------------------------------------------------------------------

export type { EdgeTag }

// Exports
// -----------------------------------------------------------------------------

export { EdgeDirection }

// init()
// -----------------------------------------------------------------------------

/**
 * Create a handle for the graph database.
 */
export function init(db: D1Database): ReturnType<typeof impl.init> {
  return impl.init(db)
}

// node()
// -----------------------------------------------------------------------------

/**
 * Lookup a single node in the database and return it as an object.
 */
export async function node(
  db: DrizzleD1Database,
  nodeId: AnyURN | undefined
): ReturnType<typeof impl.node> {
  return impl.node(db, nodeId)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that either originate or terminate at a node.
 */
export async function edges(
  db: DrizzleD1Database,
  query: EdgeQuery,
  opt?: any
): ReturnType<typeof impl.edges> {
  return impl.edges(db, query, opt)
}

// incoming()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that terminate at a node.
 */
export async function incoming(db: DrizzleD1Database, nodeId: AnyURN): ReturnType<typeof impl.incoming> {
  return impl.incoming(db, nodeId)
}

// outgoing()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that originate at a node.
 */
export async function outgoing(db: DrizzleD1Database, nodeId: AnyURN): ReturnType<typeof impl.outgoing> {
  return impl.outgoing(db, nodeId)
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
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): ReturnType<typeof impl.link> {
  return impl.link(db, src, dst, tag)
}

// unlink()
// -----------------------------------------------------------------------------

/**
 * Remove the link between two nodes.
 *
 * @returns the number of edges removed.
 */
export async function unlink(
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): ReturnType<typeof impl.unlink> {
  return impl.unlink(db, src, dst, tag)
}
