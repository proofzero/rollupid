// @kubelt/platform.edges:src/db/impl/remove.ts

/**
 * Utilities for removing data from the database.
 */

import type { AnyURN } from '@kubelt/urns'
import type { EdgeTag } from '../types'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'
import { edge as edgeTable } from '../schema'
import { and, eq, or } from 'drizzle-orm/expressions'

// edge()
// -----------------------------------------------------------------------------

/**
 * Removes an edge from the database.
 */
export async function edge(
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<any> {
  const e = edgeTable

  // DELETE FROM
  //   edge
  // WHERE
  //   src = ?1 AND dst = ?2 AND tag = ?3
  const where = and(
    eq(e.src, src.toString()),
    eq(e.dst, dst.toString()),
    eq(e.tag, tag.toString()),
  )

  return db.delete(e)
    .where(where)
    .run()
}
