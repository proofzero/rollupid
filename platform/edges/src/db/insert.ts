// @proofzero/platform.edges:src/db/impl/insert.ts

/**
 * Utilities for inserting data into the database.
 */

import type { EdgeTag, Graph } from './types'
import { parseUrnForEdge } from '@proofzero/urns/edge'

// node()
// -----------------------------------------------------------------------------

/**
 * Insert a node; if it is already present, this is a no-op.
 *
 * @returns the inserted node
 */
export function node(
  g: Graph,
  parsedUrn: ReturnType<typeof parseUrnForEdge>
): D1PreparedStatement[] {
  const { id, nid, nss, fc, qcomponent, rcomponent } = parsedUrn

  const stmts = []

  stmts.push(
    g.db
      .prepare(
        'INSERT INTO node (urn, nid, nss, fragment) VALUES (?, ?, ?, ?) \
        ON CONFLICT(urn) DO UPDATE SET fragment = excluded.fragment'
      )
      .bind(id, nid, nss, fc)
  )
  // Update the join table that records the linkage between a node
  // record and the set of records that represent the q-component
  // key/value pairs found in the node URN.
  //
  // JOIN TABLE: node_qcomp_urnq_component (nodeUrn, qcomp)
  if (qcomponent) {
    // Get the IDs of the q-component records for the node URN.
    const qcParams = new URLSearchParams(qcomponent)
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const qcJoinStmt = g.db.prepare(
      'INSERT INTO node_qcomp (nodeUrn, key, value) VALUES (?, ?, ?) \
        ON CONFLICT(nodeUrn, key) DO UPDATE SET value=excluded.value'
    )
    for (const [key, value] of qcParams.entries()) {
      stmts.push(qcJoinStmt.bind(id, key, value))
    }
  }

  // Update the join table that links a node record and the associated
  // r-component records. This works as described above for
  // q-components, but updates the node_qcomp_urnr_component table
  // instead.
  //
  // JOIN TABLE: node_qcomp_urnr_component (nodeUrn, rcomp)
  if (rcomponent) {
    // Get the IDs of the q-component records for the node URN.
    const rcParams = new URLSearchParams(rcomponent)
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const rcJoinStmt = g.db.prepare(
      'INSERT INTO node_rcomp (nodeUrn, key, value) VALUES (?, ?, ?) \
        ON CONFLICT(nodeUrn, key) DO UPDATE SET value=excluded.value'
    )
    for (const [key, value] of rcParams.entries()) {
      stmts.push(rcJoinStmt.bind(id, key, value))
    }
  }

  return stmts
}

// edge()
// -----------------------------------------------------------------------------

/**
 * Insert an edge record into the database.
 */
export function edge(
  g: Graph,
  src: ReturnType<typeof parseUrnForEdge>,
  dst: ReturnType<typeof parseUrnForEdge>,
  tag: EdgeTag
): D1PreparedStatement {
  const srcParam = `urn:${src.nid}:${src.nss}`

  const dstParam = `urn:${dst.nid}:${dst.nss}`

  const tagParam = tag.toString()

  const insertEdge = `
      INSERT INTO edge (
        src,
        dst,
        tag,
        createdTimestamp
      )
      VALUES (
        ?,
        ?,
        ?,
        datetime('now')
      )
      ON CONFLICT DO NOTHING
    `
  return g.db.prepare(insertEdge).bind(srcParam, dstParam, tagParam)
}
