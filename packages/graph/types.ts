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

// A string representing the f-component of a URN.
export type Fragment = string
// A map of URN q-components.
export type QComponents = Record<string, string>
// A map of URN r-components.
export type RComponents = Record<string, string>

/**
 * We use URNs to name and describe the nodes joined by our edges, so
 * these filtering options are based on the URN f-, r-, and q-components
 * stored as part of those node URNs. For simplicity we currently only
 * do exact matching, and all conditions must be matched for an edge to
 * be included in a filtered result. This may be revisited in the future
 * if we need more complex querying capabilities.
 */
export interface NodeFilter {
  // The "base" URN excluding f-, r-, and q-components.
  id?: AnyURN
  // Only include edges with a matching f-component (fragment).
  fr?: Fragment
  // Only include edges with all matching q-components.
  qc?: QComponents
  // Only include edges with all matching r-components.
  rc?: RComponents
}

/**
 * Define a query for a set of edges.
 */
export interface EdgeQuery {
  // The "base" URN of a node (without f-, q-, r-components).
  id?: AnyURN
  // An edge type tag; only edges of this type are included in the
  // result set.
  tag?: EdgeTag
  // The direction of the edge; if the direction is
  // EdgeDirection.Outgoing, the node ID is the edge "source" node. If
  // the direction is EdgeDirection.Incoming, the node ID is the edge
  // "destination" node. If not supplied, any edge with the node ID
  // specified for source or destination is returned.
  dir?: EdgeDirection
  // A filter for returned edges based on attributes of the source node.
  src?: NodeFilter
  // A filter for returned edges based on attributes of the destination
  // node.
  dst?: NodeFilter
}

/**
 * Options that can be passed to the edges() call to control the query
 * performed to return a set of edges.
 */
export interface EdgesOptions {
  // TODO pagination?
  // TODO cache control?
  // TODo access control?
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
