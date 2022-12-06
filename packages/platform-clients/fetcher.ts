import type {
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { createJsonRpcClient } from 'typed-json-rpc'

import type { BaseApi } from './base'

/**
 * Instantiates a client object decorated with methods specified in `Api` type.
 *
 * The client object is uses `fetcher` argument as the transport only.
 */
export default <Api extends BaseApi>(
  fetcher: Fetcher,
  requestInit: RequestInit | Request = {}
): JsonRpcClient<Api> => {
  const sendRequest = async (
    request: JsonRpcRequest
  ): Promise<JsonRpcResponse> => {
    const method = 'POST'
    const body = JSON.stringify(request)
    const response = await fetcher.fetch('http://localhost/jsonrpc', {
      method,
      body,
      ...requestInit,
    })

    const jsonRpcResponse: JsonRpcResponse = await response.json()
    if ('error' in jsonRpcResponse) {
      throw jsonRpcResponse.error
    } else {
      return jsonRpcResponse.result
    }
  }
  return createJsonRpcClient<Api>({ sendRequest })
}
