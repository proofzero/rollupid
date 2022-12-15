// @kubelt/graph:impl/rpc.ts

/**
 * RPC-related utilities.
 */

import * as _ from 'lodash'

import type { RpcError, RpcResponse, RpcRequest, RpcResult } from '@kubelt/openrpc'

// Definitions
// -----------------------------------------------------------------------------

const EDGES_URL = 'http://edges.dev/jsonrpc'

// request
// -----------------------------------------------------------------------------

/**
 * @param body - an RPC request body.
 */
export async function request(edges: Fetcher, body: RpcRequest): Promise<RpcResponse> {
  const request = new Request(EDGES_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const response = await edges.fetch(request)
  const json = await response.json() as RpcResponse

  if (Object.hasOwn(json, 'result')) {
    const result = _.get(json, 'result') as unknown
    return result as RpcResult
  } else {
    const error = _.get(json, 'error') as unknown
    return error as RpcError
  }
}
