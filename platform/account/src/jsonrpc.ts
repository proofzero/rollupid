import { error } from 'itty-router-extras'

import {
  createRequestHandler,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { HEADER_CORE_ADDRESS } from '@kubelt/platform.commons/src/constants'
import { getCoreId } from '@kubelt/platform.commons/src/utils'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import type {
  AuthorizeResult,
  WorkerApi as AccessApi,
} from '@kubelt/platform.access/src/types'

import { CoreApi, Environment, WorkerApi } from './types'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, Core } = env

  const coreId = await getCoreId(request, env)
  const core = Core.get(Core.idFromString(coreId))
  const coreClient = createFetcherJsonRpcClient<CoreApi>(core)

  const accessClient = createFetcherJsonRpcClient<AccessApi>(Access, {
    headers: {
      [HEADER_CORE_ADDRESS]: request.headers.get(HEADER_CORE_ADDRESS) as string,
    },
  })

  const api = createRequestHandler<WorkerApi>({
    async kb_getNonce(
      address: string,
      template: string,
      clientId: string,
      redirectUri: string,
      scope: string[],
      state: string
    ): Promise<string> {
      return coreClient.getNonce(
        address,
        template,
        clientId,
        redirectUri,
        scope,
        state
      )
    },
    async kb_verifyNonce(
      nonce: string,
      signature: string
    ): Promise<AuthorizeResult> {
      const challenge = await coreClient.verifyNonce(nonce, signature)
      const { clientId, redirectUri, scope, state } = challenge
      return accessClient.kb_authorize(clientId, redirectUri, scope, state)
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
