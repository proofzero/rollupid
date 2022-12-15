// @kubelt/platform.edges:src/db/impl/index.ts

/**
 * Implemenations of the edge-related database methods.
 */

import type { AnyURN } from '@kubelt/urns'

import type { Edge, EdgeId, EdgeTag, Graph, Token } from '../types'

import * as insert from './insert'
import * as remove from './remove'
import * as select from './select'

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
): Promise<EdgeId> {
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

// traversable()
// -----------------------------------------------------------------------------

export function traversable(g: Graph, id: EdgeId, token: Token): boolean {
  // TODO
  throw new Error('not yet implemented')
}

// edges()
// -----------------------------------------------------------------------------

export async function edges(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return select.edges(g, nodeId)
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
