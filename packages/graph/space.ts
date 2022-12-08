// @kubelt/graph:space.ts

/**
 * URN spaces.
 */

import { URNSpace } from 'urns'

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
