// @proofzero/urns:edge.ts

/**
 * Defines a URN space for edges in the database.
 */

import { BaseURN, parseURN } from 'urns'

import { URNSpace } from 'urns'

// EdgeURN
// -----------------------------------------------------------------------------

// A label that describes the "type" of an edge connecting two nodes.
export type EdgeURN = BaseURN<'edge-tag', string>

// EdgeSpace
// -----------------------------------------------------------------------------

/**
 * The URN namespace for link edge tags. These tags are attached to
 * edges and indicate the edge "type".
 */
export const EdgeSpace = new URNSpace('edge-tag', {})

export const parseUrnForEdge = (urn: string) => {
  const parsedURN = parseURN(urn)

  // We store the base URN as the unique node identifer.
  const id = `urn:${parsedURN.nid}:${parsedURN.nss}`

  return {
    ...parsedURN,
    fc: parsedURN.fragment || '',
    id,
  }
}
