// @kubelt/graph:impl/remove.ts

/**
 * Utilities for removing data from the database.
 */

import type { AnyURN } from '@kubelt/urns'

import type {
  Edge,
  EdgeId,
  EdgeTag,
  Graph,
} from '../types'

// edge()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function edge(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag,
): Promise<number> {
  return new Promise((resolve, reject) => {
    g.db.prepare(
      'DELETE FROM edge WHERE srcUrn = ?1 AND dstUrn = ?2 AND tag = ?3'
    )
    .bind(src, dst, tag)
    .run()
    .then((result) => {
      const { changes } = result
      resolve(changes)
    })
    .catch((e: any) => {
      reject(e.cause.message)
    })
  })
}
