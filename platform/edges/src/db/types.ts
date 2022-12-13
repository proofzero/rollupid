// @kubelt/platform.edges:src/db/types.ts

/**
 * Edge-related types.
 */

import type { AnyURN } from '@kubelt/urns'
import type { EdgeURN } from '@kubelt/urns/edge'

// Types
// -----------------------------------------------------------------------------

// An authorization token
export type Token = string

export type EdgeId = number

export type EdgeTag = EdgeURN

export enum EdgeDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
}

export interface Graph {
  // The binding for the D1 edges database.
  db: D1Database
}

export interface Node {
  // The full node URN
  urn: AnyURN
  // The URN namespace ID
  nid: string
  // The URN namespace-specific string
  nss: string
  // An optional fragment
  fragment?: string
}

export interface Edge {
  // The edge identifier
  id: number
  // The URN of the source node, where the edge originates.
  srcUrn: AnyURN
  // The URN of the sink node, where the edge terminates.
  dstUrn: AnyURN
  // The "type" of the edge.
  tag: EdgeTag
}
