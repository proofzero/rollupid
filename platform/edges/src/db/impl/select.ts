// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

// Imported Types
// -----------------------------------------------------------------------------

import * as Graph from '@kubelt/types/graph'
import { createURN, parseURN } from 'urns'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'
import { SQL } from 'drizzle-orm/sql'
import { and, eq, or } from 'drizzle-orm/expressions'
import { edge as edgeTable, permission, edgePermission, node as nodeTable, nodeQcompUrnqComponent, nodeRcompUrnrComponent, URNRComponent, URNQComponent } from '../schema'
import type { AnyURN, AnyURNSpace } from '@kubelt/urns'

import type {
  EdgeTag,
  Edge,
  Node,
  EdgeQuery,
  EdgeRecord,
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
export async function qc(db: DrizzleD1Database, nodeId: AnyURN): Promise<QComponents> {
  const nc = nodeQcompUrnqComponent
  const uc = URNQComponent

  // SELECT
  //   uc.key,
  //   uc.value
  // FROM
  //   node_qcomp_urnq_component nc
  // JOIN
  //   urnq_component uc
  // ON
  //   nc.qcomp = uc.id
  // WHERE
  //   nc.nodeUrn = ?1

  const results = await db.select(nc)
        .fields({
          key: nc.nodeUrn,
          value: nc.qcomp,
        })
        .leftJoin(uc, eq(nc.qcomp, uc.id))
        .where(eq(nc.nodeUrn, nodeId.toString()))
        .all()

  if (results) {
    // Convert the result collection into an property bag object.
    return results.reduce((prev, curr) => ({...prev, ...curr}), {})
  }
  return {}
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
export async function rc(db: DrizzleD1Database, nodeId: AnyURN): Promise<RComponents> {
  const nc = nodeRcompUrnrComponent
  const uc = URNRComponent

  // SELECT
  //   uc.key,
  //   uc.value
  // FROM
  //   node_rcomp_urnr_component nc
  // JOIN
  //   urnr_component uc
  // ON
  //   nc.rcomp = uc.id
  // WHERE
  //   nc.nodeUrn = ?1

  const results = await db.select(nc)
        .fields({
          key: nc.nodeUrn,
          value: nc.rcomp,
        })
        .leftJoin(uc, eq(nc.rcomp, uc.id))
        .where(eq(nc.nodeUrn, nodeId.toString()))
        .all()

  if (results) {
    // Convert the result collection into an property bag object.
    return results.reduce((prev, curr) => ({...prev, ...curr}), {})
  }
  return {}
}

// node()
// -----------------------------------------------------------------------------

export async function node(
  db: DrizzleD1Database,
  nodeId: AnyURN | undefined
): Promise<Node | undefined> {
  if (!nodeId) {
    return undefined
  }

  const nodeRecord = await db.select(nodeTable)
        .where(eq(nodeTable.urn, nodeId.toString()))
        .get()
  if (!nodeRecord) {
    return undefined
  }

  const qcMap = await qc(db, nodeRecord.urn as AnyURN)
  const rcMap = await rc(db, nodeRecord.urn as AnyURN)

  const parsed = parseURN(nodeRecord.urn)
  const id = createURN(parsed.nid, parsed.nss)

  const node: Node = {
    // NB: the id is the "base URN" excluding f-, r-, and q-components.
    // Should this field be called "base"?
    id,
    urn: nodeRecord.urn as AnyURN,
    nid: nodeRecord.nid,
    nss: nodeRecord.nss,
    fragment: nodeRecord.fragment,
    qc: qcMap,
    rc: rcMap,
  }

  return node
}

// permissions()
// -----------------------------------------------------------------------------
// TODO should this be exposed to return the permissions for an edge?

async function permissions(
  db: DrizzleD1Database,
  edgeId: number
): Promise<Permission[]> {
  const p = permission
  const ep = edgePermission

  // SELECT
  //   name
  // FROM
  //   permission p
  // JOIN
  //   edge_permission ep
  // ON
  //   ep.permissionId = p.id
  // WHERE
  //   e.edgeId = ?1
  const results = await db.select(p)
        .fields({ name: p.name })
        .leftJoin(ep, eq(ep.permissionId, p.id))
        .where(eq(ep.edgeId, edgeId))
        .all()

  return results.reduce((prev, curr) => {
    prev.push(curr.name)
    return prev
  }, [] as Permission[])
}

// edges()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function edges(
  db: DrizzleD1Database,
  query: EdgeQuery,
  opt?: any
): Promise<Edge[]> {
  // If a node ID is not supplied, we're returning no edges.
  //
  // TODO we don't want to allow for the possibility of all edges being
  // returned until pagination is in place. Revisit this behavior if we
  // decide to implement it.
  if (!query.id) {
    return []
  }

  const e = edgeTable

  // Build up the WHERE clause of the query.
  let where: SQL | undefined

  // Filter returned edges by direction; if we're asked for "outgoing"
  // edges, the node ID is for the "source" node of the edge. If we're
  // asked for "incoming" edges, the node ID is for the "destination"
  // node of the edge. If no direction is supplied, return all edges
  // that originate or terminate at the given node ID.
  switch (query.dir) {
  case Graph.EdgeDirection.Incoming:
    // SELECT * FROM edge e WHERE (e.dst = ?1)
    where = eq(e.dst, query.id.toString())
    break
  case Graph.EdgeDirection.Outgoing:
    // SELECT * FROM edge e WHERE (e.src = ?1)
    where = eq(e.src, query.id.toString())
    break
  default:
    // SELECT * FROM edge e WHERE (e.src = ?1 OR e.dst = ?1)
    where = or(
      eq(e.src, query.id),
      eq(e.dst, query.id),
    )
  }

  // Filter edges by tag, if provided.
  if (query.tag) {
    where = and(
      eq(e.tag, query.tag),
      where
    )
  }

  const results = await db.select(e).where(where).all()

  let edges = results as EdgeRecord[]

  if (query?.src || query?.dst) {
    edges = await nodeFilter(db, edges, query)
  }

  // Enrich each edge with the details of the referenced nodes.
  return Promise.all(
    edges.map(async (edgeRec: EdgeRecord): Promise<Edge> => {
      const srcNode: Node | undefined = await node(db, edgeRec.src)
      if (!srcNode) {
        throw new Error(`error getting node: ${edgeRec.src}`)
      }
      const src: Node = { ...srcNode, id: `urn:${srcNode.nid}:${srcNode.nss}` }

      const dstNode: Node | undefined = await node(db, edgeRec.dst)
      if (!dstNode) {
        throw new Error(`error getting node: ${edgeRec.dst}`)
      }
      const dst: Node = { ...dstNode, id: `urn:${dstNode.nid}:${dstNode.nss}` }

      const tag = edgeRec.tag

      const perms = await permissions(db, edgeRec.id)

      return {
        tag,
        src,
        dst,
        perms,
      }
    })
  )
}

// Returns true if every key/value pair in the query components is
// matched exactly in the node components.
function hasProps(
  queryComp: Record<string, string | undefined>,
  nodeComp: Record<string, string | undefined>
): boolean {
  const qSet = new Set(Object.entries(queryComp).flat())
  const nList = Object.entries(nodeComp)
        .flat()
        .filter((e) => e !== undefined)
  return nList.filter((e) => qSet.has(e)).length === nList.length
}

// Filter a collection of edges using an EdgeQuery, returning only the
// edges that match.
async function nodeFilter(
  db: DrizzleD1Database,
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
      const srcNode = await node(db, edge.src)
      if (srcNode !== undefined && srcNode.fragment !== query.src.fr) {
        return result
      }
    }
    // q-components
    if (query?.src?.qc !== undefined) {
      const srcQc = await qc(db, edge.src)
      if (!hasProps(query.src.qc, srcQc)) {
        return result
      }
    }
    // r-components
    if (query?.src?.rc !== undefined) {
      const srcRc = await rc(db, edge.src)
      if (!hasProps(query.src.rc, srcRc)) {
        return result
      }
    }

    // DST

    // fragment
    if (query?.dst?.fr !== undefined) {
      const dstNode = await node(db, edge.dst)
      if (dstNode !== undefined && dstNode.fragment !== query.dst.fr) {
        return result
      }
    }
    // q-components
    if (query?.dst?.qc !== undefined) {
      const dstQc = await qc(db, edge.dst)
      if (!hasProps(query?.dst?.qc, dstQc)) {
        return result
      }
    }
    // r-components
    if (query?.dst?.rc !== undefined) {
      const dstRc = await rc(db, edge.dst)
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


// incoming()
// -----------------------------------------------------------------------------
// TODO include permissions in results (join permissions table).

/**
 * Return a list of all the edges that terminate at the node with the
 * given node ID.
 */
export async function incoming(
  db: DrizzleD1Database,
  nodeId: AnyURN
): Promise<Edge[]> {
  const query = {
    id: nodeId,
    dir: Graph.EdgeDirection.Incoming,
  }

  return edges(db, query)
}

// outgoing()
// -----------------------------------------------------------------------------
// TODO include permissions in results (join permissions table)..

/**
 * Return a list of all the edges that originate at the node with the
 * given node ID.
 */
export async function outgoing(
  db: DrizzleD1Database,
  nodeId: AnyURN
): Promise<Edge[]> {
  const query = {
    id: nodeId,
    dir: Graph.EdgeDirection.Outgoing,
  }

  return edges(db, query)
}
