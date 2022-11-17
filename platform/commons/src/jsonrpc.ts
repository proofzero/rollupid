import {
  createJsonRpcClient,
  Func,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

export interface BaseApi {
  [key: string]: Func
}

export interface DurableObjectApi extends BaseApi {
  get(key: string): Promise<unknown>
}

/**
 * Instantiates a client object decorated with methods specified in `Api` type.
 *
 * The client object is uses `fetcher` argument as the transport only.
 */
export const createFetcherJsonRpcClient = <
  Api extends { [key in string]: Func }
>(
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
      console.error(jsonRpcResponse.error)
      throw jsonRpcResponse.error
    } else {
      return jsonRpcResponse.result
    }
  }
  return createJsonRpcClient<Api>({ sendRequest })
}
