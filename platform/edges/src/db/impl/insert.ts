// @kubelt/platform.edges:src/db/impl/insert.ts

/**
 * Utilities for inserting data into the database.
 */

import { and, eq, or } from 'drizzle-orm/expressions'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'
import type { PreparedQuery } from 'drizzle-orm-sqlite/d1'
import { parseURN } from 'urns'
import { AnyURN } from '@kubelt/urns'

import {
  edge as edgeTable,
  permission,
  edgePermission,
  node as nodeTable,
  nodeQcompUrnqComponent,
  nodeRcompUrnrComponent,
  URNRComponent,
  URNQComponent
} from '../schema'

import type { ParsedURN } from 'urns'

import type {
  Edge,
  EdgeTag,
  Node,
  EdgeId,
  EdgeRecord,
  NodeRecord,
} from '../types'

import { qc } from './select'

// node()
// -----------------------------------------------------------------------------

/**
 * Prepare q-component record insertion statements.
 *
 * After parsing the node URN, the parsedURN.qcomponent property is
 * a string that contains the "q-component" (if any) extracted from
 * the URN. This has the same format as a URI query string with the
 * leading "?" character stripped off, e.g. "foo=bar&biz=baz". Each
 * of the key/value pairs in the q-component string should get
 * written into the urnq_component table as a (key, value) row. We
 * add a single INSERT prepared statement to the stmts list for each
 * such pair that should to be added. Note that if the record
 * already exists we do nothing; that data will be shared among all
 * the URNs that happen to use that q-component key/value pair
 * (expected to be a commonplace).
 */
function prepareQComp(db: DrizzleD1Database, qComponent: string) {
  const qcParams = new URLSearchParams(qComponent)

  // Collect the parameter insertion SQL statements.
  const stmts: any = []
  for (const [key, value] of qcParams.entries()) {
    // INSERT INTO
    //   urnq_component (key, value)
    // VALUES
    //   (?1, ?2)
    // ON CONFLICT
    //   DO NOTHING
    const insertStmt = db.insert(URNQComponent)
        .values({
          key,
          value,
        })
        .onConflictDoNothing()

    stmts.push(insertStmt)
  }

  return stmts
}

/**
 * Prepare r-component record insertion statements. This works as
 * described above, but writes r-components into the urnr_component
 * table instead.
 */
function prepareRComp(db: DrizzleD1Database, rComponent: string) {
  const rcParams = new URLSearchParams(rComponent)

  // Collect the parameter insertion SQL statements.
  const stmts: any = []
  for (const [key, value] of rcParams.entries()) {
    // INSERT INTO
    //   urnr_component (key, value)
    // VALUES
    //   (?1, ?2)
    // ON CONFLICT
    //   DO NOTHING
    const insertStmt = db.insert(URNRComponent)
          .values({
            key,
            value,
          })
          .onConflictDoNothing()

    stmts.push(insertStmt)
  }

  return stmts
}

/**
 * Returns the base URN for a parsed URN.
 *
 * The base URN consists of just the NSS and NID, without any f-, r-, or
 * q-components.
 */
function baseId(parsedURN: ParsedURN): AnyURN {
  const nid = parsedURN.nid
  const nss = parsedURN.nss
  const fc = parsedURN.fragment || ''

  return `urn:${nid}:${nss}`
}

/**
 * Return an insert statement that adds a node record to the database.
 */
function insertNode(db: DrizzleD1Database, parsedURN: ParsedURN) {
  // We store the base URN as the unique node identifer.
  const urn = baseId(parsedURN)
  // URN namespace ID
  const nid = parsedURN.nid
  // URN namespace-specific value
  const nss = parsedURN.nss
  // URN fragment
  const fragment = parsedURN?.fragment || ''

  // INSERT INTO
  //   node (urn, nid, nss, fragment)
  // VALUES
  //   (?1, ?2, ?3, ?4)
  // ON CONFLICT
  //   DO NOTHING

  return db.insert(nodeTable)
    .values({ urn, nid, nss, fragment })
    .onConflictDoNothing()
    .run()
}

/**
 *
 */
async function selectComponents(
  db: DrizzleD1Database,
  table: typeof URNQComponent | typeof URNRComponent,
  component: string
) {
  // Get the IDs of the q-component records for the node URN.
  const params = new URLSearchParams(component)

  const idList: number[] = []

  for (const [key, value] of params.entries()) {
    // SELECT
    //   id
    // FROM
    //   urnq_component|urnr_component
    // WHERE
    //   key = ?1 AND
    //   value = ?2
    const result = await db.select(table)
          .fields({
            id: table.id,
          })
          .where(
            and(
              eq(table.key, key),
              eq(table.value, value),
            )
          )
          .get()

    idList.push(result.id)
  }

  return idList
}

/**
 *
 */
async function insertComponents(
  db: DrizzleD1Database,
  table: typeof nodeQcompUrnqComponent | typeof nodeRcompUrnrComponent,
  nodeId: AnyURN,
  rowIds: number[],
) {
  const nodeUrn = nodeId.toString()

  for (const rowId of rowIds) {
    const values = Object.hasOwn(table, 'qcomp') ? {
      nodeUrn,
      qcomp: rowId,
    } : {
      nodeUrn,
      rcomp: rowId,
    }
    // INSERT INTO
    //   node_qcomp_urnq_component (nodeUrn, qcomp) |
    //   node_rcomp_urnr_component (nodeUrn, rcomp)
    // VALUES
    //   (?1, ?2)
    // ON CONFLICT
    //   DO NOTHING
    await db.insert(table)
      .values(values)
      .onConflictDoNothing()
      .run()
  }
}

/**
 * Insert a node; if it is already present, this is a no-op.
 *
 * @returns the inserted node
 */
export async function node(
  db: DrizzleD1Database,
  urn: AnyURN
): Promise<NodeRecord> {
  const parsedURN = parseURN(urn)

  // Collect all the INSERT statements for q- and r-component records
  // here. We'll execute them as a single batch.
  // TODO better type.
  const stmts: any = []

  // Collect INSERT statements that put q-component records into the
  // database.
  if (parsedURN?.qcomponent) {
    stmts.concat(prepareQComp(db, parsedURN.qcomponent))
  }

  // Collect INSERT statements that put r-component records into the
  // database.
  if (parsedURN?.rcomponent) {
    stmts.concat(prepareRComp(db, parsedURN.rcomponent))
  }

  // Insert r- and q-component records by executing the batch of
  // prepared statements.
  await Promise.all(stmts.map((stmt: PreparedQuery) => stmt.run()))

  // Insert the node record.
  await insertNode(db, parsedURN)

  // The base URN for the node is its identifier.
  const nodeId = baseId(parsedURN)

  // Update the join table that records the linkage between a node
  // record and the set of records that represent the q-component
  // key/value pairs found in the node URN.
  //
  // JOIN TABLE: node_qcomp_urnq_component (nodeUrn, qcomp)
  if (parsedURN?.qcomponent) {
    // Add an entry to the join table for each q-component row that is
    // used in the node URN.
    const rowIds = await selectComponents(db, URNQComponent, parsedURN.qcomponent)
    await insertComponents(db, nodeQcompUrnqComponent, nodeId, rowIds)
  }

  // Update the join table that links a node record and the associated
  // r-component records. This works as described above for
  // q-components, but updates the node_qcomp_urnr_component table
  // instead.
  //
  // JOIN TABLE: node_qcomp_urnr_component (nodeUrn, rcomp)
  if (parsedURN?.rcomponent) {
    // Add an entry to the join table for each r-component row that is
    // used in the node URN.
    const rowIds = await selectComponents(db, URNRComponent, parsedURN.rcomponent)
    await insertComponents(db, nodeRcompUrnrComponent, nodeId, rowIds)
  }

  // Get the ID of the inserted node.
  //
  // SELECT
  //   *
  // FROM
  //   node
  // WHERE
  //   urn = ?1

  const n: unknown = await db.select(nodeTable)
    .where(eq(nodeTable.urn, nodeId.toString()))
    .get()

  return n as NodeRecord
}

// edge()
// -----------------------------------------------------------------------------

/**
 * Insert an edge record into the database.
 */
export async function edge(
  db: DrizzleD1Database,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<EdgeRecord> {
  const srcParsed = parseURN(src.toString())
  const srcParam = `urn:${srcParsed.nid}:${srcParsed.nss}`

  const dstParsed = parseURN(dst.toString())
  const dstParam = `urn:${dstParsed.nid}:${dstParsed.nss}`

  const tagParam = tag.toString()

  // INSERT INTO
  //   edge (src, dst, tag)
  // VALUES
  //   (?1, ?2, ?3)
  // ON CONFLICT
  //   DO NOTHING

  const e: unknown = await db.insert(edgeTable)
    .values({
      src: srcParam,
      dst: dstParam,
      tag: tagParam,
    })
    .onConflictDoNothing()
    .returning()
    .get()

  return e as EdgeRecord
}
