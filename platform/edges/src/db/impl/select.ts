// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

import * as _ from 'lodash'

import { EdgeDirection } from '@kubelt/graph'

// Imported Types
// -----------------------------------------------------------------------------

import type { Edge, EdgeTag, EdgeQuery, EdgesOptions, Node, NodeFilter, Permission } from '@kubelt/graph'

import type { AnyURN, AnyURNSpace } from '@kubelt/urns'

import type { EdgeRecord, Graph, NodeRecord, QComponent, QComponents, RComponent, RComponents } from '../types'

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
export async function qc(g: Graph, nodeId: AnyURN): Promise<QComponents> {
  const query = `
    SELECT
      uc.key,
      uc.value
    FROM
      node_qcomp_urnq_component nc
    JOIN
      urnq_component uc
    ON
      nc.urnqComponentId = uc.id
    WHERE
      nc.nodeUrn = ?1
  `
  const qcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all()
  // Convert the result collection into a property bag object.
  return _.reduce(qcomp.results, (acc: QComponents, result: unknown) => {
    const { key, value } = result as QComponent
    acc[key] = value
    return acc
  }, {})
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
export async function rc(g: Graph, nodeId: AnyURN): Promise<RComponents> {
  const query = `
    SELECT
      uc.key,
      uc.value
    FROM
      node_rcomp_urnr_component nc
    JOIN
      urnr_component uc
    ON
      nc.urnrComponentId = uc.id
    WHERE
      nc.nodeUrn = ?1
  `
  const rcomp = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .all()
  // Convert the result collection into an property bag object.
  return _.reduce(rcomp.results, (acc: RComponents, result: unknown) => {
    const { key, value } = result as RComponent
    acc[key] = value
    return acc
  }, {})
}

// node()
// -----------------------------------------------------------------------------

export async function node(g: Graph, nodeId: AnyURN|undefined): Promise<Node|undefined> {
  if (_.isUndefined(nodeId)) {
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
  const node = await g.db
    .prepare(query)
    .bind(nodeId.toString())
    .first()

  if (_.isUndefined(node)) {
    return undefined
  }

  const nodeUrn = _.get(node, 'urn') as unknown

  const qcMap = await qc(g, nodeUrn as AnyURN)
  _.set(node as object, 'qc', qcMap)

  const rcMap = await rc(g, nodeUrn as AnyURN)
  _.set(node as object, 'rc', rcMap)

  return node as Node
}

// permissions()
// -----------------------------------------------------------------------------
// TODO should this be exposed to return the permissions for an edge?

async function permissions(g: Graph, edgeId: number): Promise<Permission[]> {
  const query = `
    SELECT
      name
    FROM
      permission p
    JOIN
      edge_permissions_permission e
    ON
      e.permissionId = p.id
    WHERE
      e.edgeId = ?1
  `
  const result = await g.db
    .prepare(query)
    .bind(edgeId)
    .all()

  // TODO check result.success and handle query error
  const perms = result.results as string[]

  return perms as Permission[]
}

// edges()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function edges(
  g: Graph,
  query: EdgeQuery,
  opt?: EdgesOptions,
): Promise<Edge[]> {

  let sql: string

  // If a node ID is not supplied, we're returning no edges.
  //
  // TODO we don't want to allow for the possibility of all edges being
  // returned until pagination is in place. Revisit this behavior if we
  // decide to implement it.
  if (_.isUndefined(query.id)) {
    return []
  }

  // Filter returned edges by direction; if we're asked for "outgoing"
  // edges, the node ID is for the "source" node of the edge. If we're
  // asked for "incoming" edges, the node ID is for the "destination"
  // node of the edge. If no direction is supplied, return all edges
  // that originate or terminate at the given node ID.
  switch(query.dir) {
  case EdgeDirection.Incoming:
    sql = `SELECT * FROM edge e WHERE (e.dstUrn = ?1)`
    break
  case EdgeDirection.Outgoing:
    sql = `SELECT * FROM edge e WHERE (e.srcUrn = ?1)`
    break
  default:
    sql = `SELECT * FROM edge e WHERE (e.srcUrn = ?1 OR e.dstUrn = ?1)`
  }

  // Filter edges by tag, if provided.
  if (!_.isUndefined(query.tag)) {
    sql = _.join([sql, 'e.tag = ?2'], ' AND ')
  }

  const result = await g.db
    .prepare(sql)
    .bind(query.id.toString(), query.tag)
    .all()

  // TODO check result.success and handle query error
  let edges: EdgeRecord[] = result.results as EdgeRecord[]

  // Returns true if every key/value pair in the query components is
  // matched exactly in the node components.
  function hasProps(queryComp: Record<string, string>, nodeComp: Record<string, string>): boolean {
    //console.log(`query: ${JSON.stringify(queryComp, null, 2)}`)
    //console.log(`node: ${JSON.stringify(nodeComp, null, 2)}`)
    return _.reduce(queryComp, (flag: boolean, value: string, key: string): boolean => {
      return flag && nodeComp[key] === value
    }, true)
  }

  async function nodeFilter(edges: EdgeRecord[], query: EdgeQuery): Promise<EdgeRecord[]> {
    // A reducing function over a set of edges that discards any edges
    // which don't match the filter criteria supplied in the EdgeQuery.
    async function queryFilter(resultPromise: Promise<EdgeRecord[]>, edge: EdgeRecord): Promise<EdgeRecord[]> {
      const result = await resultPromise

      // SRC

      // fragment
      if (query?.src?.fr !== undefined) {
        const srcNode = await node(g, edge.srcUrn)
        if (srcNode !== undefined && srcNode.fragment !== query.src.fr) {
          return result
        }
      }
      // q-components
      if (query?.src?.qc !== undefined) {
        const srcQc = await qc(g, edge.srcUrn)
        if (!hasProps(query.src.qc, srcQc)) {
          return result
        }
      }
      // r-components
      if (query?.src?.rc !== undefined) {
        const srcRc = await rc(g, edge.srcUrn)
        if (!hasProps(query.src.rc, srcRc)) {
          return result
        }
      }

      // DST

      // fragment
      if (query?.dst?.fr !== undefined) {
        const dstNode = await node(g, edge.dstUrn)
        if (dstNode !== undefined && dstNode.fragment !== query.dst.fr) {
          return result
        }
      }
      // q-components
      if (query?.dst?.qc !== undefined) {
        const dstQc = await qc(g, edge.dstUrn)
        if (!hasProps(query?.dst?.qc, dstQc)) {
          return result
        }
      }
      // r-components
      if (query?.dst?.rc !== undefined) {
        const dstRc = await rc(g, edge.dstUrn)
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
    _.map(edges, async (edgeRec: EdgeRecord): Promise<Edge> => {
      const srcNode: Node | undefined = await node(g, edgeRec.srcUrn)
      if (_.isUndefined(srcNode)) {
        throw new Error(`error getting node: ${edgeRec.srcUrn}`)
      }
      const src: Node = { ...srcNode, id: `urn:${srcNode.nid}:${srcNode.nss}` }

      const dstNode: Node | undefined = await node(g, edgeRec.dstUrn)
      if (_.isUndefined(dstNode)) {
        throw new Error(`error getting node: ${edgeRec.dstUrn}`)
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
export async function incoming(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE dstURN = ?1')
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
export async function outgoing(g: Graph, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE srcURN = ?1')
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
