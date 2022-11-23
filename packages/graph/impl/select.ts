// @kubelt/graph:impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

import type { AnyURN } from '@kubelt/urns'

import type { Edge, EdgeId, EdgeTag, Graph } from '../types'

// edges()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function edges(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE srcUrn = ?1 OR dstUrn = ?1')
      .bind(nodeId.toString())
      .all()
      .then((result) => {
        resolve(<Edge[]>result.results)
      })
      .catch((e: any) => {
        reject(e.cause.message)
      })
  })
}

// incoming()
// -----------------------------------------------------------------------------

export async function incoming(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE dstURN = ?1')
      .bind(nodeId.toString())
      .all()
      .then((result) => {
        resolve(<Edge[]>result.results)
      })
      .catch((e: any) => {
        reject(e.cause.message)
      })
  })
}

// outgoing()
// -----------------------------------------------------------------------------

export async function outgoing(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE srcURN = ?1')
      .bind(nodeId.toString())
      .all()
      .then((result) => {
        resolve(<Edge[]>result.results)
      })
      .catch((e: any) => {
        reject(e.cause.message)
      })
  })
}
