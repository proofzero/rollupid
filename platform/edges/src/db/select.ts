// @kubelt/platform.edges:src/db/impl/select.ts

/**
 * Utilities for selecting data from the database.
 */

// Imported Types
// -----------------------------------------------------------------------------

import type { AnyURN } from '@kubelt/urns'

import type {
  Edge,
  Node,
  EdgeQuery,
  Graph as GraphDB,
  QComponent,
  QComponents,
  RComponent,
  RComponents,
  EdgeTag,
  EdgeQueryOptions,
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
      nodeUrn = ?
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
      nodeUrn = ?
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
      urn = ?
  `
  const node = await g.db.prepare(query).bind(nodeId.toString()).first<Node>()

  if (!node) {
    return undefined
  }

  const nodeUrn = node.baseUrn

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
  opt?: EdgeQueryOptions
): Promise<Edge[]> {
  const sqlBase = `
  with normalizer as (
    select e.createdTimestamp, e.src, e.tag, e.dst, 'SRCQ' as compType, srcq.key as k, srcq.value as v
    from edge e left join node_qcomp srcq on e.src = srcq.nodeUrn where k not null 
    union
    select e.createdTimestamp, e.src, e.tag, e.dst, 'SRCR' as compType, srcr.key as k, srcr.value as v
    from edge e left join node_rcomp srcr on e.src = srcr.nodeUrn where k not null
    UNION
    select e.createdTimestamp, e.src, e.tag, e.dst, 'DSTQ' as compType, dstq.key as k, dstq.value as v
    from edge e left join node_qcomp dstq on e.dst = dstq.nodeUrn where k not null 
    UNION
    select e.createdTimestamp, e.src, e.tag, e.dst, 'DSTR' as compType, dstr.key as k, dstr.value as v
    from edge e left join node_rcomp dstr on e.dst = dstr.nodeUrn where k not null
    ),
    
  extender as (
    select * from normalizer
    union
    select e.*, 'NONE' as compType, null as k, null as v from edge e 
    where not exists(select 1 from edge n where e.src=n.src and e.tag=n.tag and e.dst=n.dst)
  ),
  `

  // Intersection conditions look as follows, for each comp, with the compType being the differentiator
  // intersector as (
  //   select distinct src, tag, dst from normalizer
  //     where tag='urn:edge-tag:owns/address' and compType='DSTQ' and k='alias' and v='username'
  //   intersect
  //   select distinct src, tag, dst from normalizer
  //     where tag='urn:edge-tag:owns/address' and compType='DSTR' and k='addr_type' and v='github'
  // )

  let sqlFilters = `
  select * from
  (select dense_rank() over (order by x.src, x.tag,x.dst) as edge_no, x.* 
  from intersector i left join extender x on i.src=x.src and i.tag=x.tag and i.dst=x.dst)
  `

  const offset = opt?.offset || 0
  let optionsConditions = `where edge_no > ${offset} `
  if (opt?.limit) optionsConditions += `and edge_no <= ${offset + opt.limit} `
  sqlFilters += optionsConditions

  const finalSort = `order by createdTimestamp desc`

  enum compType {
    SRCQ = 'SRCQ',
    SRCR = 'SRCR',
    DSTQ = 'DSTQ',
    DSTR = 'DSTR',
  }

  type urnCompCondition = {
    compType: compType
    key: string
    val: string
  }
  const edgeConditionsList: Record<string, string>[] = []
  const compConditionsList: urnCompCondition[] = []

  //We bind prepared statement values only; since keys are set by our code
  //those get safely injected into queries through string templates
  const prepBindParams: string[] = []

  //Helper function to convert a comp object (record<string,string>)
  //to an array of urnCompConditions
  function getUrnCompConditions(
    compType: compType,
    comp: Record<string, string | boolean | undefined>
  ): urnCompCondition[] {
    const results = []
    for (const [k, v] of Object.entries(comp)) {
      if (k && v)
        results.push({
          compType: compType,
          key: k,
          val: v.toString(),
        })
    }
    return results
  }

  //Logic is split into conditions that apply on edge table columns and
  //comp table columns. The former either apply by themselves in a single statement,
  //or they are repeated on the condition statements of the latter to get the
  //intersector syntax from the comment above
  let conditionsStatement
  if (query.tag) edgeConditionsList.push({ tag: query.tag })
  if (query.src) {
    const src = query.src
    if (src.baseUrn) edgeConditionsList.push({ src: src.baseUrn })
    if (src.qc)
      compConditionsList.concat(getUrnCompConditions(compType.SRCQ, src.qc))
    if (src.rc)
      compConditionsList.concat(getUrnCompConditions(compType.SRCR, src.rc))
  }
  if (query.dst) {
    const dst = query.dst
    if (dst.baseUrn) edgeConditionsList.push({ dst: dst.baseUrn })
    if (dst.qc) {
      const additions = getUrnCompConditions(compType.DSTQ, dst.qc)
      compConditionsList.push(...additions)
    }
    if (dst.rc) {
      const additions = getUrnCompConditions(compType.DSTR, dst.rc)
      compConditionsList.push(...additions)
    }
  }

  if (compConditionsList.length) {
    const intersectorConditions = []
    for (const { compType, key, val } of compConditionsList) {
      const statmentPrefix = `
        select distinct src, tag, dst from extender where
        compType='${compType}' and k='${key}' and v=? 
        `
      prepBindParams.push(val)
      const statementSuffix = edgeConditionsList
        .map((o) => {
          const [[k, v]] = Object.entries(o)
          prepBindParams.push(v)
          return `${k} = ?`
        })
        .join(' AND ')
      const fullCompStatement = statmentPrefix + ' AND ' + statementSuffix
      intersectorConditions.push(fullCompStatement)
    }
    conditionsStatement = `intersector as (${intersectorConditions.join(
      ' INTERSECT '
    )}) `
  } else {
    const statmentPrefix = `
        select distinct src, tag, dst from extender where
        `
    const statementSuffix = edgeConditionsList
      .map((o) => {
        const [[k, v]] = Object.entries(o)
        prepBindParams.push(v)
        return `${k} = ?`
      })
      .join(' AND ')
    conditionsStatement = `intersector as (${statmentPrefix} ${statementSuffix}) `
  }

  const finalSqlStatement =
    sqlBase + conditionsStatement + sqlFilters + finalSort

  //Keep this .debug until we're confident around the logic
  console.debug('FULL STATEMENT', finalSqlStatement)
  console.debug('BIND PARAMS', prepBindParams)

  const resultSet = await g.db
    .prepare(finalSqlStatement)
    .bind(...prepBindParams)
    .all()

  console.debug('EXECUTION METADATA', {
    duration: resultSet.meta.duration,
    error: resultSet.error,
  })
  type resultRec = {
    edge_no: number
    createdTimestamp: string
    src: AnyURN
    tag: EdgeTag
    dst: AnyURN
    compType: compType
    k: string
    v: string
  }

  const results = []
  let currentEdgeNo
  let currentEdge: Edge
  for (const result of (resultSet.results as resultRec[]) || []) {
    if (currentEdgeNo !== result.edge_no) {
      currentEdgeNo = result.edge_no
      currentEdge = {} as Edge
      results.push(currentEdge)
      currentEdge.createdTimestamp = result.createdTimestamp
      currentEdge.tag = result.tag
      currentEdge.src = { baseUrn: result.src, qc: {}, rc: {} }
      currentEdge.dst = { baseUrn: result.dst, qc: {}, rc: {} }
    }

    let compToUpdate: Record<string, string>
    switch (result.compType) {
      case compType.SRCQ:
        compToUpdate = currentEdge!.src.qc
        break
      case compType.SRCR:
        compToUpdate = currentEdge!.src.rc
        break
      case compType.DSTQ:
        compToUpdate = currentEdge!.dst.qc
        break
      case compType.DSTR:
        compToUpdate = currentEdge!.dst.rc
        break
    }
    const compRec = { [result.k]: result.v }
    Object.assign(compToUpdate, compRec)
  }
  //Keep this .debug until we're confident about the logic
  console.debug(
    'RESULTS',
    results.map((r) => ({
      r,
      srcq: r.src.qc,
      srcr: r.src.rc,
      dstq: r.dst.qc,
      dstr: r.dst.rc,
    }))
  )
  return results
}

// incoming()
// -----------------------------------------------------------------------------

/**
 *
 */
export async function incoming(g: GraphDB, nodeId: AnyURN): Promise<Edge[]> {
  return new Promise((resolve, reject) => {
    g.db
      .prepare('SELECT * FROM edge WHERE dst = ?')
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
      .prepare('SELECT * FROM edge WHERE src = ?')
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
