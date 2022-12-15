// @kubelt/graph:impl/index.ts

/**
 * Implemenations of the graph package methods.
 */

import * as _ from 'lodash'

import { EdgeSpace } from '../space'

import { EdgeDirection } from '../types'

import type { RpcResponse, RpcErrorDetail } from '@kubelt/openrpc'

import type { Edge, EdgeTag, Token } from '../types'

import type { AnyURN } from '@kubelt/urns'

import { createAnyURNSpace } from '@kubelt/urns'

import * as rpc from './rpc'

// node
// -----------------------------------------------------------------------------

export function node(nid: string, nss: string): AnyURN {
  return createAnyURNSpace(nid).urn(nss)
}

// edge
// -----------------------------------------------------------------------------

export function edge(tag: string): EdgeTag {
  return EdgeSpace.urn(tag)
}

// link()
// -----------------------------------------------------------------------------
// TODO support permissions / scopes

export async function link(
  edges: Fetcher,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<Edge|RpcErrorDetail> {
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
  const response: RpcResponse = await rpc.request(edges, kb_makeEdge)

  if (Object.hasOwn(response, 'result')) {
    const result = _.get(response, 'result') as unknown
    return result as Edge
  } else {
    const error = response as unknown
    return error as RpcErrorDetail
  }
}

// unlink()
// -----------------------------------------------------------------------------

export async function unlink(
  edges: Fetcher,
  src: AnyURN,
  dst: AnyURN,
  tag: EdgeTag
): Promise<number|RpcErrorDetail> {
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
  const response: RpcResponse = await rpc.request(edges, kb_rmEdge)

  if (Object.hasOwn(response, 'result')) {
    const result = _.get(response, 'result') as unknown
    return result as number
  } else {
    const error = response as unknown
    return error as RpcErrorDetail
  }
}

// edges()
// -----------------------------------------------------------------------------

export async function edges(
  edges: Fetcher,
  id: AnyURN,
  tag?: EdgeTag,
  dir?: EdgeDirection,
): Promise<Edge[]|RpcErrorDetail> {
  const kb_getEdges = {
    jsonrpc: '2.0',
    id: 1,
    method: 'kb_getEdges',
    params: {
      id,
      tag,
      dir,
    },
  }
  const response: RpcResponse = await rpc.request(edges, kb_getEdges)

  if (Object.hasOwn(response, 'edges')) {
    return (_.get(response, 'edges') as unknown) as Edge[]
  } else {
    const error = response as unknown
    return error as RpcErrorDetail
  }
}
