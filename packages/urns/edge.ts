// @kubelt/urns:edge.ts

/**
 * Defines a URN space for edges in the database.
 */

import type { BaseURN } from 'urns'

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
