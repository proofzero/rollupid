// @kubelt/platform.edges:src/db/impl/index.ts

/**
 * Implemenations of the edge-related database methods.
 */

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
  Graph,
  NodeRecord,
  Token,
  EdgeTag,
} from '../types'

// init()
// -----------------------------------------------------------------------------

export function init(db: D1Database): Graph {
  return {
    db,
  }
}

// link()
// -----------------------------------------------------------------------------
// TODO migrate to typeorm once d1 driver finished
// TODO support permissions / scopes

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

export async function unlink(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<number> {
  return remove.edge(g, src, dst, tag)
}

// node()
// -----------------------------------------------------------------------------

export async function node(
  g: Graph,
  nodeId: AnyURN | undefined
): Promise<Node | undefined> {
  return select.node(g, nodeId)
}

// edges()
// -----------------------------------------------------------------------------

export async function edges(
  g: Graph,
  query: EdgeQuery,
  opt?: any
): Promise<Edge[]> {
  return select.edges(g, query, opt)
}

// incoming()
// -----------------------------------------------------------------------------

export async function incoming(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return select.incoming(g, nodeId)
}

// outgoing()
// -----------------------------------------------------------------------------

export async function outgoing(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return select.outgoing(g, nodeId)
}
