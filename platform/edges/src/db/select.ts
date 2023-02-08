// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

// Imported Types
// -----------------------------------------------------------------------------

import { Graph } from '@kubelt/types'
import type { AnyURN } from '@kubelt/urns'

import type {
  Edge,
  Node,
  EdgeQuery,
  EdgeRecord,
  Graph as GraphDB,
  QComponent,
  QComponents,
  RComponent,
  RComponents,
} from './types'

// qc()
// -----------------------------------------------------------------------------

/**
 * Returns the q-components for the node having the given ID. If the
 * node doesn't exist, an empty mapping is returned.
 *
 * @param g - the graph database handle
 * @param nodeId - a node URN
 * @returns a map of q-components for the node
 */
export async function qc(g: GraphDB, nodeId: AnyURN): Promise<QComponents> {
  const query = `
    SELECT
      key,
      value
    FROM
      node_qcomp
    WHERE
      nodeUrn = ?1
  `
  const qcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all<QComponent>()
  // Convert the result collection into a property bag object.

  if (qcomp.results) {
    const reduced = qcomp.results?.reduce(
      (prev, curr) => prev.set(curr.key, curr.value),
      new Map<string, string>()
    )
    return Object.fromEntries(reduced)
  } else return {}
}

// rc()
// -----------------------------------------------------------------------------

/**
 * Returns the r-components for the node having the given ID. If the
 * node doesn't exist, an empty mapping is returned.
 *
 * @param g - the graph database handle
 * @param nodeId - a node URN
 * @returns a map of r-components for the node
 */
export async function rc(g: GraphDB, nodeId: AnyURN): Promise<RComponents> {
  const query = `
    SELECT
      key,
      value
    FROM
      node_rcomp
    WHERE
      nodeUrn = ?1
  `
  const rcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all<RComponent>()
  // Convert the result collection into an property bag object.
  if (rcomp.results) {
    const reduced = rcomp.results?.reduce(
      (prev, curr) => prev.set(curr.key, curr.value),
      new Map<string, string>()
    )
    return Object.fromEntries(reduced)
  } else return {}
}

// node()
// -----------------------------------------------------------------------------

export async function node(
  g: GraphDB,
  nodeId: AnyURN | undefined
): Promise<Node | undefined> {
  if (!nodeId) {
    return undefined
  }

  const query = `
    SELECT
      *
    FROM
      node
    WHERE
      urn = ?1
  `
  const node = await g.db.prepare(query).bind(nodeId.toString()).first<Node>()

  if (!node) {
    return undefined
  }

  const nodeUrn = node.urn

  const qcMap = await qc(g, nodeUrn as AnyURN)
  node.qc = qcMap

  const rcMap = await rc(g, nodeUrn as AnyURN)
  node.rc = rcMap

  return node as Node
}

// edges()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function edges(
  g: GraphDB,
  query: EdgeQuery,
  opt?: any
): Promise<Edge[]> {
  let sql: string

  // If a node ID is not supplied, we're returning no edges.
  //
  // TODO we don't want to allow for the possibility of all edges being
  // returned until pagination is in place. Revisit this behavior if we
  // decide to implement it.
  if (!query.id) {
    return []
  }

  // Filter returned edges by direction; if we're asked for "outgoing"
  // edges, the node ID is for the "source" node of the edge. If we're
  // asked for "incoming" edges, the node ID is for the "destination"
  // node of the edge. If no direction is supplied, return all edges
  // that originate or terminate at the given node ID.
  switch (query.dir) {
    case Graph.EdgeDirection.Incoming:
      sql = `SELECT * FROM edge e WHERE (e.dst = ?1)`
      break
    case Graph.EdgeDirection.Outgoing:
      sql = `SELECT * FROM edge e WHERE (e.src = ?1)`
      break
    default:
      sql = `SELECT * FROM edge e WHERE (e.src = ?1 OR e.dst = ?1)`
  }

  let statement

  // Filter edges by tag, if provided.
  if (query.tag) {
    sql += ' AND e.tag = ?2 ORDER BY createdTimestamp ASC'
    statement = g.db.prepare(sql).bind(query.id.toString(), query.tag)
  } else {
    sql += ' ORDER BY createdTimestamp ASC'
    statement = g.db.prepare(sql).bind(query.id.toString())
  }

  const result = await statement.all()

  // TODO check result.success and handle query error
  let edges: EdgeRecord[] = result.results as EdgeRecord[]

  // Returns true if every key/value pair in the query components is
  // matched exactly in the node components.
  function hasCompMatches(
    queryComp: Record<string, string | boolean | undefined>,
    nodeComp: Record<string, string | boolean>
  ): boolean {
    const nodeKeys = Object.keys(nodeComp)

    const compKeys = Object.keys(queryComp)
      // .flat()
      .filter((e) => queryComp[e] !== undefined)

    // if there is nothing to filter on then default to true
    if (!compKeys.length) {
      return true
    }

    const matches = nodeKeys.filter((e) => {
      if (compKeys.includes(e)) {
        const q = queryComp[e]?.toString() // convert boolean to string
        const n = nodeComp[e]
        console.log({
          e,
          q: queryComp[e]?.toString(),
          n: nodeComp[e],
          pass: q === n,
        })
        return q === n
      }
      return true
    })

    // console.log({ queryComp, qList, nodeComp, matches })

    return matches.length > 0
  }

  async function nodeFilter(
    edges: EdgeRecord[],
    query: EdgeQuery
  ): Promise<EdgeRecord[]> {
    // A reducing function over a set of edges that discards any edges
    // which don't match the filter criteria supplied in the EdgeQuery.
    async function queryFilter(
      resultPromise: Promise<EdgeRecord[]>,
      edge: EdgeRecord
    ): Promise<EdgeRecord[]> {
      const result = await resultPromise

      // SRC

      // fragment
      if (query?.src?.fr !== undefined) {
        const srcNode = await node(g, edge.src)
        if (srcNode !== undefined && srcNode.fragment !== query.src.fr) {
          return result
        }
      }
      // q-components
      if (query?.src?.qc !== undefined) {
        const srcQc = await qc(g, edge.src)
        if (!hasCompMatches(query.src.qc, srcQc)) {
          return result
        }
      }
      // r-components
      if (query?.src?.rc !== undefined) {
        const srcRc = await rc(g, edge.src)
        if (!hasCompMatches(query.src.rc, srcRc)) {
          return result
        }
      }

      // DST

      // fragment
      if (query?.dst?.fr) {
        const dstNode = await node(g, edge.dst)
        if (dstNode !== undefined && dstNode.fragment !== query.dst.fr) {
          return result
        }
      }
      // q-components
      if (query?.dst?.qc && Object.keys(query?.dst?.qc).length) {
        const dstQc = await qc(g, edge.dst)
        if (!hasCompMatches(query?.dst?.qc, dstQc)) {
          return result
        }
      }
      // r-components
      if (query?.dst?.rc && Object.keys(query?.dst?.rc).length) {
        const dstRc = await rc(g, edge.dst)
        if (!hasCompMatches(query.dst.rc, dstRc)) {
          return result
        }
      }

      // Include the current edge in the list of returned edges; it has
      // passed filtering.
      result.push(edge)

      return result
    }

    return edges.reduce(queryFilter, Promise.resolve([]))
  }

  if (query?.src !== undefined || query?.dst !== undefined) {
    edges = await nodeFilter(edges, query)
  }

  // Enrich each edge with the details of the referenced nodes.
  return Promise.all(
    edges.map(async (edgeRec: EdgeRecord): Promise<Edge> => {
      const srcNode: Node | undefined = await node(g, edgeRec.src)
      if (!srcNode) {
        throw new Error(`error getting node: ${edgeRec.src}`)
      }
      const src: Node = { ...srcNode, id: `urn:${srcNode.nid}:${srcNode.nss}` }

      const dstNode: Node | undefined = await node(g, edgeRec.dst)
      if (!dstNode) {
        throw new Error(`error getting node: ${edgeRec.dst}`)
      }
      const dst: Node = { ...dstNode, id: `urn:${dstNode.nid}:${dstNode.nss}` }

      const tag = edgeRec.tag
      const createdTimestamp = edgeRec.createdTimestamp

      return {
        tag,
        src,
        dst,
        createdTimestamp,
      }
    })
  )
}

// incoming()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function incoming(g: GraphDB, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE dst = ?1')
      .bind(nodeId.toString())
      .all()
      .then((result) => {
        resolve(<Edge[]>result.results)
      })
      .catch((e: unknown) => {
        reject(e)
      })
  })
}

// outgoing()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function outgoing(g: GraphDB, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE src = ?1')
      .bind(nodeId.toString())
      .all()
      .then((result) => {
        resolve(<Edge[]>result.results)
      })
      .catch((e: unknown) => {
        reject(e)
      })
  })
}
