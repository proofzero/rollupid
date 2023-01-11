// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

// Imported Types
// -----------------------------------------------------------------------------

import { Graph } from '@kubelt/types'
import type { AnyURN, AnyURNSpace } from '@kubelt/urns'

import type {
  EdgeTag,
  Edge,
  Node,
  EdgeQuery,
  EdgeRecord,
  Graph as GraphDB,
  NodeRecord,
  NodeFilter,
  QComponent,
  QComponents,
  RComponent,
  RComponents,
  Permission,
} from '../types'

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
      uc.key,
      uc.value
    FROM
      node_qcomp_urnq_component nc
    JOIN
      urnq_component uc
    ON
      nc.qcomp = uc.id
    WHERE
      nc.nodeUrn = ?1
  `
  const qcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all<QComponent>()
  // Convert the result collection into a property bag object.
  if (qcomp.results)
    return qcomp.results?.reduce((prev, curr) => ({ ...prev, ...curr }), {})
  else return {}
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
      uc.key,
      uc.value
    FROM
      node_rcomp_urnr_component nc
    JOIN
      urnr_component uc
    ON
      nc.rcomp = uc.id
    WHERE
      nc.nodeUrn = ?1
  `
  const rcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all<RComponent>()
  // Convert the result collection into an property bag object.
  if (rcomp.results)
    return rcomp.results?.reduce((prev, curr) => ({ ...prev, ...curr }), {})
  else return {}
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

// permissions()
// -----------------------------------------------------------------------------
// TODO should this be exposed to return the permissions for an edge?

async function permissions(g: GraphDB, edgeId: number): Promise<Permission[]> {
  const query = `
    SELECT
      name
    FROM
      permission p
    JOIN
      edge_permission e
    ON
      e.permissionId = p.id
    WHERE
      e.edgeId = ?1
  `
  const result = await g.db.prepare(query).bind(edgeId).all<Permission>()
  // TODO check result.success and handle query error
  const perms = result.results

  return perms as Permission[]
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
    sql = [sql, 'e.tag = ?2'].join(' AND ')

    statement = g.db.prepare(sql).bind(query.id.toString(), query.tag)
  } else {
    statement = g.db.prepare(sql).bind(query.id.toString())
  }

  const result = await statement.all()

  console.log({ result })
  // TODO check result.success and handle query error
  let edges: EdgeRecord[] = result.results as EdgeRecord[]

  // Returns true if every key/value pair in the query components is
  // matched exactly in the node components.
  function hasProps(
    queryComp: Record<string, string | undefined>,
    nodeComp: Record<string, string | undefined>
  ): boolean {
    //console.log(`query: ${JSON.stringify(queryComp, null, 2)}`)
    //console.log(`node: ${JSON.stringify(nodeComp, null, 2)}`)
    const qSet = new Set(Object.entries(queryComp).flat())
    const nList = Object.entries(nodeComp)
      .flat()
      .filter((e) => e !== undefined)
    return nList.filter((e) => qSet.has(e)).length === nList.length
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
        if (!hasProps(query.src.qc, srcQc)) {
          return result
        }
      }
      // r-components
      if (query?.src?.rc !== undefined) {
        const srcRc = await rc(g, edge.src)
        if (!hasProps(query.src.rc, srcRc)) {
          return result
        }
      }

      // DST

      // fragment
      if (query?.dst?.fr !== undefined) {
        const dstNode = await node(g, edge.dst)
        if (dstNode !== undefined && dstNode.fragment !== query.dst.fr) {
          return result
        }
      }
      // q-components
      if (query?.dst?.qc !== undefined) {
        const dstQc = await qc(g, edge.dst)
        if (!hasProps(query?.dst?.qc, dstQc)) {
          return result
        }
      }
      // r-components
      if (query?.dst?.rc !== undefined) {
        const dstRc = await rc(g, edge.dst)
        if (!hasProps(query.dst.rc, dstRc)) {
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

      const perms = await permissions(g, edgeRec.id)

      return {
        tag,
        src,
        dst,
        perms,
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
