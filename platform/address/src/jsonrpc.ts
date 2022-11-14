import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { createFetcherJsonRpcClient } from '@kubelt/worker-commons/src/jsonrpc'

import { Environment } from './types'
import { CoreApi, WorkerApi } from './types'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Core } = env

  const getCoreClient = (address: string): JsonRpcClient<CoreApi> => {
    const core = Core.get(Core.idFromName(address))
    return createFetcherJsonRpcClient<CoreApi>(core)
  }

  const api = createRequestHandler<WorkerApi>({
    async kb_setAddress(address: string, coreId: string): Promise<void> {
      const client = getCoreClient(address)
      return client.kb_setAddress(address, coreId)
    },
    async kb_unsetAddress(address: string): Promise<void> {
      const client = getCoreClient(address)
      return client.kb_unsetAddress()
    },
    async kb_resolveAddress(address: string): Promise<string> {
      const client = getCoreClient(address)
      return client.kb_resolveAddress(address)
    },
  })

  try {
    const jsonRpcRequest: JsonRpcRequest = await request.json()
    const jsonRpcResponse: JsonRpcResponse = await api.handleRequest(
      jsonRpcRequest
    )
    if ('error' in jsonRpcResponse) {
      console.error(jsonRpcResponse.error)
    }
    return new Response(JSON.stringify(jsonRpcResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error(err)
    return error(500, JSON.stringify(err))
  }
}
