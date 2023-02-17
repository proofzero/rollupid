// @kubelt/platform.edges:src/db/impl/remove.ts

/**
 * Utilities for removing data from the database.
 */

import type { AnyURN } from '@kubelt/urns'

import type { Graph, EdgeTag } from './types'

// edge()
// -----------------------------------------------------------------------------

/**
 * Removes an edge from the database.
 */
export async function edge(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<any> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('DELETE FROM edge WHERE src = ? AND dst = ? AND tag = ?')
      .bind(src, dst, tag)
      .run()
      .then((result) => {
        const { success } = result
        resolve(success ? 1 : 0)
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
