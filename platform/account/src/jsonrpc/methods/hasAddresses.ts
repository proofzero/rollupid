import * as graph from '@kubelt/graph'
import * as openrpc from '@kubelt/openrpc'
import {
  RpcContext,
  RpcRequest,
  RpcService,
  RpcErrorDetail,
} from '@kubelt/openrpc'
import { AccountURNSpace } from '@kubelt/urns/account'
import { EdgeSpace } from '@kubelt/urns/edge'
import { EdgeDirection } from '@kubelt/graph'
import type { Edge } from '@kubelt/graph'

import { ErrorInvalidAccountId, ErrorInvalidAddressType } from '../errors'

import type { GetAddressesParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const edges: Fetcher = context.get('Edges')

  // WIP

  /*
  // Parameters:
  // - account is *required*
  // - edgeType is *optional*; if present we use it to filter the
  //   returned edge list
  const [account, edgeType] = request.params as GetAddressesParams

  if (!AccountURNSpace.is(account)) {
    const detail = Object.assign({ data: account }, ErrorInvalidAccountId)
    return openrpc.error(request, detail)
  }
  const src = account

  if (edgeType !== undefined && !EdgeSpace.is(edgeType)) {
    const detail = Object.assign({ data: edgeType }, ErrorInvalidEdgeType)
    return openrpc.error(request, detail)
  }
  const tag = edgeType

  // We are only interested in edges that start at the address node and
  // terminate at the account node, assuming that address nodes link to
  // their owning account node.
  const dir = EdgeDirection.Incoming

  // Request the list of edges that originate at the account and have
  // the given type.
  const edgeResult: Edge[] | RpcErrorDetail = await graph.edges(
    edges,
    src,
    tag,
    dir
  )

  if (Array.isArray(edgeResult)) {
    // The source nodes in the returned edges are the URNs of the
    // account nodes.
    const edgeList = edgeResult.map((edge: Edge) => {
      return edge.src.urn
    })
    return openrpc.response(request, edgeList)
  } else {
    // We got back an error, return it to the caller.
    return openrpc.error(request, edgeResult)
  }
  */

  return openrpc.response(request, {})
}
