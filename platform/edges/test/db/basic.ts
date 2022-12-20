// @kubelt/graph:test/db/basic.ts

import tap from 'tap'

import * as _ from 'lodash'
import * as fs from 'fs'
import * as urns from 'urns'

// Rely on local miniflare to provide an interface to the wrangler D1
// database that we can use with our graph db package; in production the
// DB instance is injected as a binding to the worker service, but here
// we need to construct that "binding" to the database ourselves.
import { BetaDatabase } from '@miniflare/d1'
import { createSQLiteDB, SqliteDB } from '@miniflare/shared'

// We use these ORM classes to more easily inspect the database; these
// are what we use to define the database in the first place.
import { ENTITIES, FileDataSource, MemDataSource } from '../../db/data-source'
//import {} from '../../src/db/types'
/*
import { Edge } from '../../db/entity/Edge'
import { Node } from '../../db/entity/Node'
import { Permission } from '../../db/entity/Permission'
import { URNQComponent } from '../../db/entity/URNQComponent'
import { URNRComponent } from '../../db/entity/URNRComponent'
*/

import * as db from '../../src/db'

import * as security from '@kubelt/security'
import * as scopes from '@kubelt/security/scopes'

import type { EdgeRecord } from '../../src/db/types'

import type { Edge } from '@kubelt/graph'

import * as graph from '@kubelt/graph'

// Definitions
// -----------------------------------------------------------------------------

const srcURN = graph.node("example", "source")

const dstURN = graph.node("example", "destination")

const edgeTag = graph.edge(`example`)

// SQL
// -----------------------------------------------------------------------------
// The DDL used to create the edges database is generated by:
// - generating the database using typeorm:
//   $ npx yarn run db:start
// - running a CLI on the generated database:
//   $ sqlite .wrangler/state/d1/EDGES.sqlite3
// - editing the generated SQL to remove:
//    BEGIN TRANSACTION
//    COMMIT
//   as these are not supported in production environment database.

const EDGES_DDL = fs.readFileSync('./edges.sql', 'utf8')

const DB_CREATE = _.filter(EDGES_DDL.split(/\r?\n/), s => _.trim(s) !== '')

const DB_TRUNCATE = [
  `DELETE FROM urnq_component;`,
  `DELETE FROM urnr_component;`,
  `DELETE FROM node;`,
  `DELETE FROM permission;`,
  `DELETE FROM edge;`,
  `DELETE FROM node_qcomp_urnq_component;`,
  `DELETE FROM node_rcomp_urnr_component;`,
  `DELETE FROM edge_permissions_permission;`,
  `DELETE FROM sqlite_sequence;`,
]

// Lifecycle (@miniflare/d1)
// -----------------------------------------------------------------------------
// A D1 Database is injected into a worker as a SQLite client. We use an
// ORM to interrogate the database to validate that it has the expected
// shape after test operations are performed.

let d1: D1Database

tap.before(async () => {
  // This constructs a D1Database of the same sort as would be injected
  // as a binding.
  const db: unknown = new BetaDatabase(await createSQLiteDB(':memory:'))
  d1 = <D1Database>db

  const stmts = []
  for (const stmt of DB_CREATE) {
    stmts.push(await d1.prepare(stmt))
  }
  await d1.batch(stmts)
})

tap.beforeEach(async (t) => {
  // INSERT fixture data
})

tap.afterEach(async (t) => {
  // TRUNCATE all tables
  const stmts = []
  for (const stmt of DB_TRUNCATE) {
    stmts.push(await d1.prepare(stmt))
  }
  await d1.batch(stmts)
})

// Lifecycle (typeorm)
// -----------------------------------------------------------------------------
// This is an example of how to use typeorm to initialize an in-memory
// database. Unfortunately I haven't yet figured out how to wrap the
// internal DB instance maintained by typeorm so that it looks like an
// injected D1Database.
//
// Plan: add support to typeorm for D1, and then when we are given a D1
// database binding we can use it to initialize a typeorm DataSource
// that is then passed to graph.init() to get a handle that allows for
// DB reading and writing.
/*
tap.before(async () => {
  // Construct the database tables, indices, etc. based on the the
  // entities in the data source configuration.
  return MemDataSource.initialize()
})

// Initialize an in-memory database before each test.
tap.beforeEach(async (t) => {
  // TODO create addNode() in db/index and use here as well
  const parsed = urns.parseURN(srcURN)
  const node = new Node()
  node.urn = srcURN
  node.nid = parsed.nid
  node.nss = parsed.nss
  node.fragment = parsed.fragment || ""
  // TODO rc, qc
  await MemDataSource.manager.save(node)
})

tap.afterEach(async (t) => {
  // Truncate all entity tables.
  for (const entity of ENTITIES) {
    MemDataSource.getRepository(entity).clear()
  }
})

tap.teardown(async () => {
  return MemDataSource.destroy()
})
*/

// graph.link()
// -----------------------------------------------------------------------------

/*
tap.test('link', async (t) => {
  const g = db.init(d1)
  const edge: EdgeRecord = await db.link(g, srcURN, dstURN, edgeTag)
  tap.equal(1, edge.id, 'the first edge should have an ID of 1')

  t.end()
  })
*/

// graph.unlink()
// -----------------------------------------------------------------------------

/*
tap.test('unlink', async (t) => {
  const g = db.init(d1)
  const result = await db.unlink(g, srcURN, dstURN, edgeTag)
  tap.equal(1, result, 'only one edge should have been removed')

  t.end()
})
*/

// graph.edges()
// -----------------------------------------------------------------------------
// TODO test filtering by edge type
// TODO test filtering by edge direction
// TODO test filtering by f-comp, r-comp, q-comp

/*
tap.test('edges', async (t) => {
  const g = db.init(d1)
  const link: EdgeRecord = await db.link(g, srcURN, dstURN, edgeTag)
  console.log(link)

  // FIXME there should be two nodes here, not just 1
  console.log(await g.db.prepare("SELECT * FROM node").all())

  //const edges: Edge[] = await db.edges(g, srcURN)
  //console.log(edges)
  //tap.equal(1, edges.length, 'there should only be a single edge')

  //const edge: Edge = edges[0]
  //console.log(edge)
  //tap.equal(edgeTag, edge.tag)
  //tap.equal(srcURN, edge.src.urn)
  //tap.equal(dstURN, edge.dst.urn)

  t.end()
})
*/
