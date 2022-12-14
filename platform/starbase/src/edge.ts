// @threeid/platform.starbase:src/edge.ts

import * as _ from 'lodash'

import * as jose from 'jose'

import { HEADER_ACCESS_TOKEN } from '@kubelt/platform.commons/src/constants'

import type { AccountURN } from '@kubelt/urns/account'

import { AccountURNSpace } from '@kubelt/urns/account'

// Definitions
// -----------------------------------------------------------------------------

const EDGES_URL = 'http://edges.dev/jsonrpc'

// link()
// -----------------------------------------------------------------------------

/**
 * Make a call to remote edges service to create a link between nodes.
 */
export async function link(
  edges: Fetcher,
  src: string,
  dst: string,
  tag: string
) {
  const kb_makeEdge = {
    jsonrpc: '2.0',
    id: 1,
    method: 'kb_makeEdge',
    params: {
      src,
      dst,
      tag,
    },
  }
  const edgeReq = new Request(EDGES_URL, {
    method: 'POST',
    body: JSON.stringify(kb_makeEdge),
  })

  return edges.fetch(edgeReq)
}

// unlink()
// -----------------------------------------------------------------------------

/**
 * Make a call to remote edges service to remove a link between nodes.
 */
export async function unlink(
  edges: Fetcher,
  src: string,
  dst: string,
  tag: string
) {
  const kb_rmEdge = {
    jsonrpc: '2.0',
    id: 1,
    method: 'kb_rmEdge',
    params: {
      src,
      dst,
      tag,
    },
  }
  const edgeReq = new Request(EDGES_URL, {
    method: 'POST',
    body: JSON.stringify(kb_rmEdge),
  })

  return edges.fetch(edgeReq)
}

// edges()
// -----------------------------------------------------------------------------

/**
 * Get a list of edges entering or leaving a node.
 */
export async function edges(edges: Fetcher, id: string, tag: string) {
  const kb_getEdges = {
    jsonrpc: '2.0',
    id: 1,
    method: 'kb_getEdges',
    params: {
      id,
    },
  }
  const edgeReq = new Request(EDGES_URL, {
    method: 'POST',
    body: JSON.stringify(kb_getEdges),
  })

  const response = await edges.fetch(edgeReq)
  const json: object = (await response.json()) || {}
  if (Object.hasOwn(json, 'error')) {
    return _.get(json, 'error')
  }

  const edgeList = _.get(json, ['result', 'edges'])

  // Filter on edge type.
  // TODO move into edges service! It should accept additional parameters:
  // - direction
  // - tag
  return _.filter(edgeList, (edge) => {
    return _.get(edge, 'srcUrn') === id && _.get(edge, 'tag') === tag
  })
}

// // assertUniqueLink()
// TODO: @ROB can we make this query shape work diredclty in SQL?
// export async function assertUniqueLink(
//   accountURN: string,
//   rComponents?: Record<string, string>
// ): Promise<boolean> {
//   const kb_getEdges = {
//     jsonrpc: '2.0',
//     id: 1,
//     method: 'kb_getEdges',
//     params: {
//       dst: {
//         id: accountURN,
//       },
//       src:{
//         nid: 'threeid',
//         nss: 'app',
//         rComponents
//       }

//     },
//   }
//   // Search for unique links with the components joined
// }
