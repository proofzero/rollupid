// @kubelt/urns:edge.ts

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
export const EdgeSpace = new URNSpace('edge-tag', {
  // TODO constrain allowed values for edge tags. Should possibly allow
  // sub-typing for more interesting graph queries.
  /*
  pred: (s: string) => {

  }
  */
  /*
  decode: (nss) => {
    // TODO process the NSS, throw if invalid
  }
  */
})

export const parseUrnForEdge = (urn: string) => {
  const parsedURN = parseURN(urn)

  // Insert node record into the "node" table.
  const nid = parsedURN.nid
  const nss = parsedURN.nss
  const fc = parsedURN.fragment || ''
  const qcomponent = parsedURN.qcomponent
  const rcomponent = parsedURN.rcomponent

  // We store the base URN as the unique node identifer.
  const id = `urn:${nid}:${nss}`

  return {
    nid,
    nss,
    fc,
    qcomponent,
    rcomponent,
    id,
  }
}
