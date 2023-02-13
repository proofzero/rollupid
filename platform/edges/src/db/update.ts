// @kubelt/platform.edges:src/db/impl/insert.ts

/**
 * Utilities for inserting data into the database.
 */

import * as urns from 'urns'

import { AnyURN } from '@kubelt/urns'

import type { EdgeTag, EdgeRecord, Graph, NodeRecord } from './types'

// node()
// -----------------------------------------------------------------------------

/**
 * Insert a node; if it is already present, this does an upsert.
 *
 * @returns the inserted node
 */
export async function node(g: Graph, urn: AnyURN): Promise<NodeRecord> {
  const parsedURN = urns.parseURN(urn)

  // Insert node record into the "node" table.
  const nid = parsedURN.nid
  const nss = parsedURN.nss
  const fc = parsedURN.fragment || ''

  // We store the base URN as the unique node identifer.
  const id = `urn:${nid}:${nss}`

  await g.db
    .prepare(
      'INSERT INTO node (urn, nid, nss, fragment) VALUES (?1, ?2, ?3, ?4) \
        ON CONFLICT(urn) DO UPDATE SET fragment = excluded.fragment'
    )
    .bind(id, nid, nss, fc)
    .run()
  // Update the join table that records the linkage between a node
  // record and the set of records that represent the q-component
  // key/value pairs found in the node URN.
  //
  // JOIN TABLE: node_qcomp_urnq_component (nodeUrn, qcomp)
  if (parsedURN.qcomponent) {
    // Get the IDs of the q-component records for the node URN.
    const qcParams = new URLSearchParams(parsedURN.qcomponent)
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const qcJoinStmt = g.db.prepare(
      'INSERT INTO node_qcomp (nodeUrn, key, value) VALUES (?1, ?2, ?3) \
        ON CONFLICT(nodeUrn, key) DO UPDATE SET value=excluded.value'
    )
    const stmts = []
    for (const [key, value] of qcParams.entries()) {
      stmts.push(qcJoinStmt.bind(id, key, value))
    }
    await g.db.batch(stmts)
  }

  // Update the join table that links a node record and the associated
  // r-component records. This works as described above for
  // q-components, but updates the node_qcomp_urnr_component table
  // instead.
  //
  // JOIN TABLE: node_qcomp_urnr_component (nodeUrn, rcomp)
  if (parsedURN.rcomponent) {
    // Get the IDs of the q-component records for the node URN.
    const qcParams = new URLSearchParams(parsedURN.rcomponent)
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const rcJoinStmt = g.db.prepare(
      'INSERT INTO node_rcomp (nodeUrn, key, value) VALUES (?1, ?2, ?3) \
        ON CONFLICT(nodeUrn, key) DO UPDATE SET value=excluded.value'
    )
    const stmts = []
    for (const [key, value] of qcParams.entries()) {
      stmts.push(rcJoinStmt.bind(id, key, value))
    }
    await g.db.batch(stmts)
  }

  // Get the ID of the inserted node.
  const node = g.db
    .prepare('SELECT * FROM node WHERE urn = ?1')
    .bind(id)
    .first() as unknown

  return node as NodeRecord
}

// edge()
// -----------------------------------------------------------------------------

/**
 * Insert an edge record into the database.
 */
export async function edge(
  g: Graph,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<EdgeRecord> {
  return new Promise((resolve, reject) => {
    const srcParsed = urns.parseURN(src.toString())
    const srcParam = `urn:${srcParsed.nid}:${srcParsed.nss}`

    const dstParsed = urns.parseURN(dst.toString())
    const dstParam = `urn:${dstParsed.nid}:${dstParsed.nss}`

    const tagParam = tag.toString()

    const insertEdge = `
      INSERT INTO edge (
        src,
        dst,
        tag
      )
      VALUES (
        ?1,
        ?2,
        ?3
      )
      ON CONFLICT DO NOTHING
    `
    g.db
      .prepare(insertEdge)
      .bind(srcParam, dstParam, tagParam)
      .run()
      .then(async (result) => {
        // TODO check for error; there is a .success property in the
        // result but referring to it causes a type error.
        if (result.error) {
          reject()
        }

        const edge = await g.db
          .prepare(
            'SELECT * FROM edge WHERE src = ?1 AND dst = ?2 AND tag = ?3'
          )
          .bind(srcParam, dstParam, tagParam)
          .first()

        resolve(edge as EdgeRecord)
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
