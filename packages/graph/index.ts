// @kubelt/graph:packages/graph/index.ts

/**
 * Platform graph definitions and utilities.
 */

import { EdgeSpace } from '@kubelt/urns/edge'

import * as impl from './impl/index'

import { EdgeDirection } from './types'

// Imported Types
// -----------------------------------------------------------------------------

import type { RpcErrorDetail } from '@kubelt/openrpc'

import type { AnyURN } from '@kubelt/urns'

import type { Edge, EdgeTag, Node, Permission, Token } from './types'

// Exported Types
// -----------------------------------------------------------------------------

export type { Edge, EdgeTag, Node, Permission, Token }

// Exports
// -----------------------------------------------------------------------------

export { EdgeDirection, EdgeSpace }

// node()
// -----------------------------------------------------------------------------

/**
 * Create a node URN.
 */
export function node(nid: string, nss: string): AnyURN {
  return impl.node(nid, nss)
}

// edge()
// -----------------------------------------------------------------------------

/**
 * Return an edge tag constructed from the given tag string.
 */
export function edge(tag: string): EdgeTag {
  return impl.edge(tag)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Return the set of edges that either originate or terminate at a node.
 */
export async function edges(
  edges: Fetcher,
  id: AnyURN,
  tag?: EdgeTag,
  dir?: EdgeDirection,
): Promise<Edge[] | RpcErrorDetail> {
  return impl.edges(edges, id, tag, dir)
}

// link()
// -----------------------------------------------------------------------------

/**
 * Create a link between two nodes.
 *
 * @param edges - the edges service binding
 * @param src - the ID of the source node
 * @param dst - the ID of the destination node
 * @param tag - a tag representing the edge type
 *
 * @returns the ID of the created edge, or -1 on error
 */
export async function link(
  edges: Fetcher,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<Edge | RpcErrorDetail> {
  return impl.link(edges, src, dst, tag)
}

// unlink()
// -----------------------------------------------------------------------------

/**
 * Remove the link between two nodes.
 *
 * @param edges - the edges service binding
 * @param src - the ID of the source node
 * @param dst - the ID of the destination node
 * @param tag - a tag representing the edge type
 * @returns the number of edges removed.
 */
export async function unlink(
  edges: Fetcher,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<number | RpcErrorDetail> {
  return impl.unlink(edges, src, dst, tag)
}
