import {
  createJsonRpcClient,
  Func,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

export interface FetcherJsonRpcClientOptions {
  headers?: {
    [key in string]: string
  }
}

export const createFetcherJsonRpcClient = <
  Api extends { [key in string]: Func }
>(
  fetcher: Fetcher,
  options: FetcherJsonRpcClientOptions = {}
): JsonRpcClient<Api> => {
  const sendRequest = async (
    request: JsonRpcRequest
  ): Promise<JsonRpcResponse> => {
    const body = JSON.stringify(request)
    const headers = options.headers
    const response = await fetcher.fetch('http://localhost', {
      body,
      headers,
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
