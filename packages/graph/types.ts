// @kubelt/graph:type.ts

/**
 * Types related to the graph storage service.
 */

import type { BaseURN } from 'urns'
import type { AnyURN } from '@kubelt/urns'
import type { EdgeURN } from '@kubelt/urns/edge'

// Types
// -----------------------------------------------------------------------------

// An authorization token.
export type Token = string

// A label that describes the "type" of an edge connecting two nodes.
export type EdgeTag = EdgeURN

export enum EdgeDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
}

export type Permission = string

export interface Edge {
  // The source node, where the edge originates.
  src: Node
  // The destination node, where the edge terminates.
  dst: Node
  // The "type" of the edge.
  tag: EdgeTag
  // The permissions associated with the edge.
  perms: Permission[]
}

export interface Node {
  // The node "base" URN: urn:<nid>:<nss>
  id: AnyURN
  // The node "full" URN, with components, fragments, etc.
  urn: AnyURN
  // The node URN namespace ID
  nid: string
  // The node URN namespace-specific string
  nss: string
  // The node URN fragment identifier
  fragment: string
  // A map of the q-components in the URN
  // TODO use QComponents type
  qc: Record<string, string>
  // A map of the r-components in the URN
  // TODO use RComponents type
  rc: Record<string, string>
}
