// @kubelt/graph:type.ts

/**
 *
 */

import type { BaseURN } from 'urns'
import type { AnyURN } from '@kubelt/urns'

// Types
// -----------------------------------------------------------------------------

// An authorization token
export type Token = string

export type EdgeId = number

// A label that describes the "type" of an edge connecting two nodes.
export type EdgeTag = BaseURN<'edge-tag', string>

export enum EdgeDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
}

export interface Graph {
  // The binding for the D1 edges database.
  db: D1Database
}

export interface Edge {
  // The URN of the source node, where the edge originates.
  srcUrn: AnyURN
  // The URN of the sink node, where the edge terminates.
  dstUrn: AnyURN
  // The "type" of the edge.
  tag: EdgeTag
}
