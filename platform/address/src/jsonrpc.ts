import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import {
  AuthorizeResult,
  ResponseType,
  WorkerApi as AccessApi,
} from '@kubelt/platform.access/src/types'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import { ADDRESS_OPTIONS } from './constants'
import { CoreApi, Environment, WorkerApi } from './types'
import { getType } from './utils'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, Core, Oort } = env

  const accessClient = createFetcherJsonRpcClient<AccessApi>(Access)

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
    async kb_resolveAddress(address: string): Promise<string | undefined> {
      const client = getCoreClient(address)
      const coreId = await client.kb_resolveAddress()
      if (coreId) {
        return coreId
      } else {
        const response = await Oort.fetch(`http://localhost/address/${address}`)
        if (response.ok) {
          const { coreId }: { coreId: string } = await response.json()
          await client.kb_setAddress(address, coreId)
          return client.kb_resolveAddress()
        } else {
          const type = getType(address)
          if (type != 'eth') {
            throw 'cannot resolve'
          }

          const coreId = hexlify(randomBytes(ADDRESS_OPTIONS.length))
          await client.kb_setAddress(address, coreId)
          return client.kb_resolveAddress()
        }
      }
    },
    async kb_getNonce(
      template: string,
      clientId: string,
      redirectUri: string,
      scope: string[],
      state: string
    ): Promise<string> {
      const client = getCoreClient(clientId)
      return client.kb_getNonce(template, clientId, redirectUri, scope, state)
    },
    async kb_verifyNonce(
      address: string,
      nonce: string,
      signature: string
    ): Promise<AuthorizeResult> {
      const client = getCoreClient(address)
      const coreId = await this.kb_resolveAddress(address)
      if (!coreId) {
        throw 'missing core identifier'
      }
      const challenge = await client.kb_verifyNonce(nonce, signature)
      const { clientId, redirectUri, scope, state } = challenge
      return accessClient.kb_authorize(
        coreId,
        clientId,
        redirectUri,
        scope,
        state,
        ResponseType.Code
      )
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
