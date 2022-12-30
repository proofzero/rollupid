// @kubelt/platform.edges:src/db/impl/insert.ts

/**
 * Utilities for inserting data into the database.
 */

import * as _ from 'lodash'

import * as urns from 'urns'

import { AnyURN } from '@kubelt/urns'

import type { Edge, EdgeTag, Node } from '@kubelt/graph'

import type { EdgeId, EdgeRecord, Graph, NodeRecord } from '../types'

// node()
// -----------------------------------------------------------------------------

/**
 * Insert a node; if it is already present, this is a no-op.
 *
 * @returns the inserted node
 */
export async function node(g: Graph, urn: AnyURN): Promise<NodeRecord> {
  const parsedURN = urns.parseURN(urn)

  // Collect all the INSERT statements for q- and r-component records
  // here. We'll execute them as a single batch.
  const stmts = []

  // Prepare q-component record insertion statements.
  //
  // After parsing the node URN, the parsedURN.qcomponent property is
  // a string that contains the "q-component" (if any) extracted from
  // the URN. This has the same format as a URI query string with the
  // leading "?" character stripped off, e.g. "foo=bar&biz=baz". Each
  // of the key/value pairs in the q-component string should get
  // written into the urnq_component table as a (key, value) row. We
  // add a single INSERT prepared statement to the stmts list for each
  // such pair that should to be added. Note that if the record
  // already exists we do nothing; that data will be shared among all
  // the URNs that happen to use that q-component key/value pair
  // (expected to be a commonplace).
  if (parsedURN.qcomponent) {
    const qcParams = new URLSearchParams(parsedURN.qcomponent)
    const qcStmt = g.db.prepare(
      'INSERT INTO urnq_component (key, value) VALUES (?1, ?2) ON CONFLICT DO NOTHING'
    )
    for (const [key, value] of qcParams.entries()) {
      stmts.push(qcStmt.bind(key, value))
    }
  }
  // Prepare r-component record insertion statements. This works as
  // described above, but writes r-components into the urnr_component
  // table instead.
  if (parsedURN.rcomponent) {
    const rcParams = new URLSearchParams(parsedURN.rcomponent)
    const rcStmt = g.db.prepare(
      'INSERT INTO urnr_component (key, value) VALUES (?1, ?2) ON CONFLICT DO NOTHING'
    )
    for (const [key, value] of rcParams.entries()) {
      stmts.push(rcStmt.bind(key, value))
    }
  }

  // Insert r- and q-component records by executing the batch of
  // prepared statements.
  await g.db.batch(stmts)

  // Insert node record into the "node" table.
  const nid = parsedURN.nid
  const nss = parsedURN.nss
  const fc = parsedURN.fragment || ""

  // We store the base URN as the unique node identifer.
  const id = `urn:${nid}:${nss}`

  await g.db.prepare(
    'INSERT INTO node (urn, nid, nss, fragment) VALUES (?1, ?2, ?3, ?4) ON CONFLICT DO NOTHING'
  )
  .bind(id, nid, nss, fc)
  .run()

  // Update the join table that records the linkage between a node
  // record and the set of records that represent the q-component
  // key/value pairs found in the node URN.
  //
  // JOIN TABLE: node_qcomp_urnq_component (nodeUrn, urnqComponentId)
  if (parsedURN.qcomponent) {
    // Get the IDs of the q-component records for the node URN.
    const qcParams = new URLSearchParams(parsedURN.qcomponent)
    const qcStmt = g.db.prepare(
      'SELECT id FROM urnq_component WHERE key = ?1 AND value = ?2'
    )
    const selects = []
    for (const [key, value] of qcParams.entries()) {
      selects.push(qcStmt.bind(key, value))
    }
    const qcResult = await g.db.batch(selects)
    // Collect an array of row IDs from the table rows containing q-components.
    const allRowIds = _.reduce(qcResult, (acc: number[], o: Record<string, unknown>): number[] => {
      const results = _.get(o, 'results')
      if (results == undefined) {
        return acc
      }
      return _.concat(acc, _.map(results, (result: unknown): number => {
        return _.get(result, 'id') || -1
      }))
    }, [])
    // Filter out any negative (error) row IDs.
    const rowIds = _.filter(allRowIds, (n) => { return n >= 0 })
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const qcJoinStmt = g.db.prepare(
      'INSERT INTO node_qcomp_urnq_component (nodeUrn, urnqComponentId) VALUES (?1, ?2) ON CONFLICT DO NOTHING'
    )
    const inserts = []
    for (const rowId of rowIds) {
      inserts.push(qcJoinStmt.bind(id, rowId))
    }
    await g.db.batch(inserts)
  }

  // Update the join table that links a node record and the associated
  // r-component records. This works as described above for
  // q-components, but updates the node_qcomp_urnr_component table
  // instead.
  //
  // JOIN TABLE: node_qcomp_urnr_component (nodeUrn, urnrComponentId)
  if (parsedURN.rcomponent) {
    const rcParams = new URLSearchParams(parsedURN.rcomponent)
    const rcStmt = g.db.prepare(
      'SELECT id FROM urnr_component WHERE key = ?1 AND value = ?2'
    )
    const selects = []
    for (const [key, value] of rcParams.entries()) {
      selects.push(rcStmt.bind(key, value))
    }
    const rcResult = await g.db.batch(selects)
    // Collect an array of row IDs fro the table rows containing r-components.
    const allRowIds = _.reduce(rcResult, (acc: number[], o: Record<string, unknown>): number[] => {
      const results = _.get(o, 'results')
      if (results === undefined) {
        return acc
      }
      return _.concat(acc, _.map(results, (result: unknown): number => {
        return _.get(result, 'id') || -1
      }))
    }, [])
    // Filter out any negative (error) row IDs.
    const rowIds = _.filter(allRowIds, (n) => { return n >= 0 })
    // Add an entry to the join table for each r-component row that is
    // used in the node URN.
    const rcJoinStmt = g.db.prepare(
      'INSERT INTO node_rcomp_urnr_component (nodeUrn, urnrComponentId) VALUES (?1, ?2) ON CONFLICT DO NOTHING'
    )
    const inserts = []
    for (const rowId of rowIds) {
      inserts.push(rcJoinStmt.bind(id, rowId))
    }
    await g.db.batch(inserts)
  }

  // Get the ID of the inserted node.
  const node = g.db.prepare(
    'SELECT * FROM node WHERE urn = ?1'
  )
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
        srcUrn,
        dstUrn,
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
        if (_.get(result, 'success', false) === false) {
          reject()
        }

        const edge = await g.db.prepare(
          'SELECT * FROM edge WHERE srcUrn = ?1 AND dstUrn = ?2 AND tag = ?3'
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
