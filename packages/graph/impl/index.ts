// @kubelt/graph:impl/index.ts

/**
 * Implemenations of the graph package methods.
 */

import * as _ from 'lodash'

import * as insert from './insert'
import * as remove from './remove'
import * as select from './select'

import { EdgeSpace } from '../space'

import type { Edge, EdgeId, EdgeTag, Graph, Token } from '../types'

import type { AnyURN } from '@kubelt/urns'

import { createAnyURNSpace } from '@kubelt/urns'

// init()
// -----------------------------------------------------------------------------

export function init(db: D1Database): Graph {
  return {
    db,
  }
}

// node
// -----------------------------------------------------------------------------

export function node(nid: string, nss: string): AnyURN {
  return createAnyURNSpace(nid).urn(nss)
}

// edge
// -----------------------------------------------------------------------------

export function edge(tag: string): EdgeTag {
  return EdgeSpace.urn(tag)
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
  return insert.edge(g, src, dst, tag)
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
  return false
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
