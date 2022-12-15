// @kubelt/platform.edges:src/db/impl/remove.ts

/**
 * Utilities for removing data from the database.
 */

import type { AnyURN } from '@kubelt/urns'

import type {
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
    .catch((e: unknown) => {
      // NB: using instanceof to narrow the type of e doesn't appear to
      // work.
      /*
      if (e instanceof Error) {
        reject(e.cause.message)
      } else {
        reject(String(e))
      }
      */
      reject(e)
    })
  })
}
