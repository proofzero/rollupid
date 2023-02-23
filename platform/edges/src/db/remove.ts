// @kubelt/platform.edges:src/db/impl/remove.ts

/**
 * Utilities for removing data from the database.
 */

import { AnyURN } from '@kubelt/urns'

import type { Graph, EdgeTag } from './types'

// edge()
// -----------------------------------------------------------------------------

/**
 * Removes an edge from the database.
 */
export function edge(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): D1PreparedStatement {
  return g.db
    .prepare('DELETE FROM edge WHERE src = ? AND dst = ? AND tag = ?')
    .bind(src, dst, tag)
}
