// @kubelt/platform.edges:src/db/impl/index.ts

/**
 * Implemenations of the edge-related database methods.
 */

import { drizzle, DrizzleD1Database } from 'drizzle-orm-sqlite/d1'

import * as insert from './insert'
import * as remove from './remove'
import * as select from './select'

// Imported Types
// -----------------------------------------------------------------------------

import type { AnyURN } from '@kubelt/urns'

import type {
  Node,
  Edge,
  EdgeQuery,
  EdgeRecord,
  EdgeId,
  NodeRecord,
  Token,
  EdgeTag,
} from '../types'

// init()
// -----------------------------------------------------------------------------

export function init(db: D1Database): DrizzleD1Database {
  return drizzle(db)
}

// link()
// -----------------------------------------------------------------------------
// TODO migrate to typeorm once d1 driver finished
// TODO support permissions / scopes

export async function link(
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<EdgeRecord> {
  const srcNode = await insert.node(db, src)
  // TODO check for error

  const dstNode = await insert.node(db, dst)
  // TODO check for error

  // Return existing edge ID (if found) or new edge ID (if created).
  return insert.edge(db, srcNode.urn, dstNode.urn, tag)
}

// unlink()
// -----------------------------------------------------------------------------

export async function unlink(
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<number> {
  return remove.edge(db, src, dst, tag)
}

// node()
// -----------------------------------------------------------------------------

export async function node(
  db: DrizzleD1Database,
  nodeId: AnyURN | undefined
): Promise<Node | undefined> {
  return select.node(db, nodeId)
}

// edges()
// -----------------------------------------------------------------------------

export async function edges(
  db: DrizzleD1Database,
  query: EdgeQuery,
  opt?: any
): Promise<Edge[]> {
  return select.edges(db, query, opt)
}

// incoming()
// -----------------------------------------------------------------------------

export async function incoming(db: DrizzleD1Database, nodeId: AnyURN): Promise<Edge[]> {
  return select.incoming(db, nodeId)
}

// outgoing()
// -----------------------------------------------------------------------------

export async function outgoing(db: DrizzleD1Database, nodeId: AnyURN): Promise<Edge[]> {
  return select.outgoing(db, nodeId)
}
