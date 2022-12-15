// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

import * as _ from 'lodash'

import { EdgeDirection } from '@kubelt/graph'

// Imported Types
// -----------------------------------------------------------------------------

import type { Edge, EdgeTag, Node, Permission } from '@kubelt/graph'

import type { AnyURN, AnyURNSpace } from '@kubelt/urns'

import type { EdgeRecord, Graph, NodeRecord, QComponent, QComponents, RComponent, RComponents } from '../types'

// qc()
// -----------------------------------------------------------------------------

export async function qc(g: Graph, nodeId: AnyURN): Promise<QComponents> {
  const query = `
    SELECT
      *
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

export async function rc(g: Graph, nodeId: AnyURN): Promise<RComponents> {
  const query = `
    SELECT
      *
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
  nodeId: AnyURN,
  tag?: EdgeTag,
  dir?: EdgeDirection
): Promise<Edge[]> {
  let query

  // Filter returned edges by direction; if we're asked for "outgoing"
  // edges, the node ID is for the "source" node of the edge. If we're
  // asked for "incoming" edges, the node ID is for the "destination"
  // node of the edge. If no direction is supplied, return all edges
  // that originate or terminate at the given node ID.
  switch(dir) {
  case EdgeDirection.Incoming:
    query = `SELECT * FROM edge e WHERE (e.dstUrn = ?1)`
    break
  case EdgeDirection.Outgoing:
    query = `SELECT * FROM edge e WHERE (e.srcUrn = ?1)`
    break
  default:
    query = `SELECT * FROM edge e WHERE (e.srcUrn = ?1 OR e.dstUrn = ?1)`
  }

  // Filter edges by tag, if provided.
  if (!_.isUndefined(tag)) {
    query = _.join([query, 'e.tag = ?2'], ' AND ')
  }

  const result = await g.db
    .prepare(query)
    .bind(nodeId.toString(), tag)
    .all()

  // TODO check result.success and handle query error

  const edges: EdgeRecord[] = result.results as EdgeRecord[]

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
