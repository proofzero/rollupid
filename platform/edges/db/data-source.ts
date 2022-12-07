// @kubelt/platform.edges:db/data-source.ts

import "reflect-metadata"

import { DataSource } from "typeorm"

import { Edge } from "./entity/Edge"
import { Node } from "./entity/Node"
import { Permission } from "./entity/Permission"
import { URNQComponent } from "./entity/URNQComponent"
import { URNRComponent } from "./entity/URNRComponent"

// The list of entities in the database.
export const ENTITIES = [
  Edge,
  Node,
  Permission,
  URNQComponent,
  URNRComponent,
]

// In-memory database for testing.
export const MemDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  logging: false,
  entities: ENTITIES,
  migrations: [],
  subscribers: [],
})

// Local SQLite3 database file.
export const FileDataSource = new DataSource({
  type: "sqlite",
  database: ".wrangler/state/d1/EDGES.sqlite3",
  synchronize: true,
  logging: false,
  entities: ENTITIES,
  migrations: [],
  subscribers: [],
})

// TODO extend typeorm with a D1 driver; start by cloning the sqlite
// driver. This should effectively work the same as sqlite, only the
// prepared queries should communicate with D1 either via wrangler:
//
// Run with:
// $ wrangler --local --persist
//
// From a subshell:
// $ wrangler d1 execute <DATABASE_NAME> --local --command='SELECT ...'
// $ wrangler d1 execute <DATABASE_NAME> --local --file='./schema.sql'
//
// OR
//
// From a worker:
//
// export interface Env {
//   <BINDING_NAME>: D1Database;
// }
//
// async fetch(request: Request, env: Env) {
//   const { results } = await env.<BINDING_NAME>.prepare("SELECT...")
//     .bind(...)
//     .all();

// Local wrangler D1
/*
export const LocalDataSource = new DataSource({
  type: "d1",
  local: true,
  synchronize: true,
  logging: false,
  entities: [Edge, Permission],
  migrations: [],
  subscribers: [],
})
*/

// Remove wrangler D1
/*
export const RemoteDataSource = new DataSource({
  type: "d1",
  local: false,
  synchronize: true,
  logging: false,
  entities: [Edge, Permission],
  migrations: [],
  subscribers: [],
})
*/
