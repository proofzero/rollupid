// @proofzero/platform.edges:src/db/impl/insert.ts

/**
 * Utilities for inserting data into the database.
 */

import { parseUrnForEdge } from '@proofzero/urns/edge'

import type { EdgeTag, Graph } from './types'

// node()
// -----------------------------------------------------------------------------

/**
 * Insert a node; if it is already present, this does an upsert.
 *
 * @returns the inserted node
 */
export function node(
  g: Graph,
  parsedUrn: ReturnType<typeof parseUrnForEdge>
): D1PreparedStatement[] {
  const stmts = []
  const { id, nid, nss, fc, qcomponent, rcomponent } = parsedUrn

  stmts.push(
    g.db
      .prepare(
        'INSERT INTO node (urn, nid, nss, fragment) VALUES (?, ?, ?, ?) \
        ON CONFLICT(urn) DO UPDATE SET fragment = excluded.fragment'
      )
      .bind(id, nid, nss, fc)
  )
  // .run()
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
    // const stmts = []
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
    const qcParams = new URLSearchParams(rcomponent)
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const rcJoinStmt = g.db.prepare(
      'INSERT INTO node_rcomp (nodeUrn, key, value) VALUES (?, ?, ?) \
        ON CONFLICT(nodeUrn, key) DO UPDATE SET value=excluded.value'
    )
    const stmts = []
    for (const [key, value] of qcParams.entries()) {
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
  parseSrcUrn: ReturnType<typeof parseUrnForEdge>,
  parsedDstUrn: ReturnType<typeof parseUrnForEdge>,
  tag: EdgeTag
): D1PreparedStatement {
  // return new Promise((resolve, reject) => {
  const srcParam = `urn:${parseSrcUrn.nid}:${parseSrcUrn.nss}`
  const dstParam = `urn:${parsedDstUrn.nid}:${parsedDstUrn.nss}`

  const tagParam = tag.toString()

  const insertEdge = `
      INSERT INTO edge (
        src,
        dst,
        tag
      )
      VALUES (
        ?,
        ?,
        ?
      )
      ON CONFLICT DO NOTHING
    `
  return g.db.prepare(insertEdge).bind(srcParam, dstParam, tagParam)
}
