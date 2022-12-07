// @kubelt/graph:test/db/basic.ts

import tap from 'tap'

import * as _ from 'lodash'
import * as urns from 'urns'

// Rely on local miniflare to provide an interface to the wrangler D1
// database that we can use with our graph db package; in production the
// DB instance is injected as a binding to the worker service, but here
// we need to construct that "binding" to the database ourselves.
import { BetaDatabase } from '@miniflare/d1'
import { createSQLiteDB, SqliteDB  } from '@miniflare/shared'

// We use these ORM classes to more easily inspect the database; these
// are what we use to define the database in the first place.
import { ENTITIES, FileDataSource, MemDataSource } from '../../db/data-source'
import { Edge } from '../../db/entity/Edge'
import { Node } from '../../db/entity/Node'
import { Permission } from '../../db/entity/Permission'
import { URNQComponent } from '../../db/entity/URNQComponent'
import { URNRComponent } from '../../db/entity/URNRComponent'

import * as graph from '@kubelt/graph'
import * as security from '@kubelt/security'
import * as scopes from '@kubelt/security/scopes'

// Definitions
// -----------------------------------------------------------------------------

const srcURN = graph.node("example", "source")

const dstURN = graph.node("example", "destination")

const edgeTag = graph.edge(`urn:edge-tag:example`)

// SQL
// -----------------------------------------------------------------------------

const DB_CREATE = [
  `PRAGMA foreign_keys=OFF;`,
  `BEGIN TRANSACTION;`,
  `CREATE TABLE IF NOT EXISTS "urnq_component" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar(64) NOT NULL, "value" varchar(512) NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "urnr_component" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar(64) NOT NULL, "value" varchar(512) NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "node" ("urn" varchar(8192) PRIMARY KEY NOT NULL, "nid" varchar NOT NULL, "nss" varchar NOT NULL, "fragment" varchar NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "edge" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tag" varchar(512) NOT NULL, "srcUrn" varchar(8192), "dstUrn" varchar(8192), CONSTRAINT "FK_7934aaa128dae90ec204dbb1bfd" FOREIGN KEY ("srcUrn") REFERENCES "node" ("urn") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_118fde23e798563fe2ee7953bcf" FOREIGN KEY ("dstUrn") REFERENCES "node" ("urn") ON DELETE NO ACTION ON UPDATE NO ACTION);`,
  `CREATE TABLE IF NOT EXISTS "node_qcomp_urnq_component" ("nodeUrn" varchar(8192) NOT NULL, "urnqComponentId" integer NOT NULL, CONSTRAINT "FK_45d7217ee65960dcb8bf0c25215" FOREIGN KEY ("nodeUrn") REFERENCES "node" ("urn") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_73c3634039a7d02cb0614ef1841" FOREIGN KEY ("urnqComponentId") REFERENCES "urnq_component" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("nodeUrn", "urnqComponentId"));`,
  `CREATE TABLE IF NOT EXISTS "node_rcomp_urnr_component" ("nodeUrn" varchar(8192) NOT NULL, "urnrComponentId" integer NOT NULL, CONSTRAINT "FK_b66713a755c2fd40b787fe3e8ad" FOREIGN KEY ("nodeUrn") REFERENCES "node" ("urn") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_927a22c66a8de3412d9bfe7451e" FOREIGN KEY ("urnrComponentId") REFERENCES "urnr_component" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("nodeUrn", "urnrComponentId"));`,
  `CREATE TABLE IF NOT EXISTS "edge_permissions_permission" ("edgeId" integer NOT NULL, "permissionId" integer NOT NULL, CONSTRAINT "FK_ce2e8da3e45963cf393a7918282" FOREIGN KEY ("edgeId") REFERENCES "edge" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_408364323672a4fe150ecf1ad3e" FOREIGN KEY ("permissionId") REFERENCES "permission" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("edgeId", "permissionId"));`,
  `CREATE UNIQUE INDEX "IDX_a4f0c73580e9e6f12e7f7b84d3" ON "urnq_component" ("key", "value");`,
  `CREATE UNIQUE INDEX "IDX_622f2e1467a15629238a71bce9" ON "urnr_component" ("key", "value");`,
  `CREATE UNIQUE INDEX "IDX_984490e919edd4c94e399aae97" ON "edge" ("srcUrn", "dstUrn", "tag");`,
  `CREATE INDEX "IDX_45d7217ee65960dcb8bf0c2521" ON "node_qcomp_urnq_component" ("nodeUrn");`,
  `CREATE INDEX "IDX_73c3634039a7d02cb0614ef184" ON "node_qcomp_urnq_component" ("urnqComponentId");`,
  `CREATE INDEX "IDX_b66713a755c2fd40b787fe3e8a" ON "node_rcomp_urnr_component" ("nodeUrn");`,
  `CREATE INDEX "IDX_927a22c66a8de3412d9bfe7451" ON "node_rcomp_urnr_component" ("urnrComponentId");`,
  `CREATE INDEX "IDX_ce2e8da3e45963cf393a791828" ON "edge_permissions_permission" ("edgeId");`,
  `CREATE INDEX "IDX_408364323672a4fe150ecf1ad3" ON "edge_permissions_permission" ("permissionId");`,
]

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

tap.test('link', async (t) => {
  const g = graph.init(d1)
  const result = await graph.link(g, srcURN, dstURN, edgeTag)
  tap.equal(1, result, 'the first edge should have an ID of 1')

  t.end()
})

// graph.unlink()
// -----------------------------------------------------------------------------

tap.test('unlink', async (t) => {
  const g = graph.init(d1)
  const result = await graph.unlink(g, srcURN, dstURN, edgeTag)
  tap.equal(1, result, 'only one edge should have been removed')

  t.end()
})

// graph.edges()
// -----------------------------------------------------------------------------

tap.test('edges', async (t) => {
  const g = graph.init(d1)

  await graph.link(g, srcURN, dstURN, edgeTag)
  const edges = await graph.edges(g, srcURN)
  tap.equal(1, edges.length, 'there should only be a single edge')

  const edge: graph.Edge = edges[0]
  tap.equal(1, edge.id)
  tap.equal(edgeTag, edge.tag)
  tap.equal(srcURN, edge.srcUrn)
  tap.equal(dstURN, edge.dstUrn)

  t.end()
})

// graph.incoming()
// -----------------------------------------------------------------------------

tap.test('incoming', async (t) => {
  // TODO
  t.end()
})

// graph.outgoing()
// -----------------------------------------------------------------------------

tap.test('outgoing', async (t) => {
  // TODO
  t.end()
})

// graph.traversable()
// -----------------------------------------------------------------------------

tap.test('traversable', async (t) => {
  // TODO
  t.end()
})
