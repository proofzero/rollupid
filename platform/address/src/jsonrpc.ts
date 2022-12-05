import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { AccountURN } from '@kubelt/urns/account'

import {
  AuthorizeResult,
  ResponseType,
  WorkerApi as AccessApi,
} from '@kubelt/platform.access/src/types'

import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  Environment,
  AddressCoreApi,
  CryptoCoreApi,
  WorkerApi,
  CryptoWorkerApi,
  AddressProfile,
  CryptoCoreType,
} from './types'
import { resolveAddress3RN } from './utils'
import { default as CryptoCoreStatic } from './crypto-core'

const checkEnvVars = (env: Environment) => {
  if (!env.NFTAR_CHAIN_ID) {
    throw new Error('Missing env variable: NFTAR_CHAIN_ID')
  }

  if (!env.NFTAR_TOKEN) {
    throw new Error('Missing env variable: NFTAR_TOKEN')
  }

  if (!env.NFTAR_URL) {
    throw new Error('Missing env variable: NFTAR_URL')
  }

  if (!env.MINTPFP_CONTRACT_ADDRESS) {
    throw new Error('Missing env variable: MINTPFP_CONTRACT_ADDRESS')
  }

  if (!env.ENS_RESOLVER_URL) {
    throw new Error('Missing env variable: ENS_RESOLVER_URL')
  }
}

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, CryptoCore } = env

  // proto middleware for all requests
  //--------------------------------------------------------------------------------
  checkEnvVars(env)

  // TODO: JWT validation

  // validate 3RN
  const resolved3RN = await resolveAddress3RN(request)
  const { name, nodeType } = resolved3RN
  let { addressType } = resolved3RN

  // route to correct DO
  let core = null
  let client: JsonRpcClient<AddressCoreApi | CryptoCoreApi>
  let address = name

  if (!name) {
    throw new Error('missing 3RN name query parameter')
  }

  switch (nodeType) {
    case CryptoCoreType.Crypto:
    case undefined:
    case null: {
      {
        ;({ address, addressType } = await CryptoCoreStatic.validateAddress(
          name,
          addressType
        ))
        core = CryptoCore.get(CryptoCore.idFromName(address))
        client = createFetcherJsonRpcClient<CryptoCoreApi>(core)
      }
      break
    }
    default: {
      throw `invalid 3RN nodeType ${nodeType}`
    }
  }

  const coreAddress = await client.getAddress()
  const coreType = await client.getType()

  // first time setup
  if (!coreAddress || !coreType) {
    console.log('first time setup')
    const namePromise = client.setAddress(address)
    const typePromise = client.setType(addressType)
    await Promise.all([namePromise, typePromise])
  }
  //--------------------------------------------------------------------------------
  // end proto middleware

  const baseApiHandlers: WorkerApi = {
    async kb_setAccount(accountUrn: string): Promise<void> {
      return client.setAccount(accountUrn)
    },
    async kb_unsetAccount(): Promise<void> {
      return client.kb_unsetAddress()
    },
    async kb_resolveAccount(): Promise<AccountURN> {
      return client.resolveAccount()
    },
  }

  const cryptoApiHandlers: CryptoWorkerApi = {
    ...baseApiHandlers,
    // TODO: function to be deprecated pass support period for oort migration
    async kb_resolveAccount(): Promise<AccountURN> {
      return client.resolveAccount()
    },
    async kb_getNonce(
      template: string,
      clientId: string,
      redirectUri: string,
      scope: string[],
      state: string
    ): Promise<string> {
      return client.getNonce(template, clientId, redirectUri, scope, state)
    },
    async kb_verifyNonce(
      nonce: string,
      signature: string
    ): Promise<AuthorizeResult> {
      const account = await client.resolveAccount()
      const responseType = ResponseType.Code
      const challenge = await client.verifyNonce(nonce, signature)
      const { clientId, redirectUri, scope, state } = challenge
      const accessClient = createFetcherJsonRpcClient<AccessApi>(Access)
      return accessClient.kb_authorize({
        account,
        responseType,
        clientId,
        redirectUri,
        scope,
        state,
      })
    },
    async kb_setAddressProfile(profile: AddressProfile): Promise<void> {
      return client.setProfile(profile)
    },
    async kb_getAddressProfile(): Promise<AddressProfile | undefined> {
      return client.getProfile()
    },
    async kb_getPfpVoucher(): Promise<object | undefined> {
      return client.getPfpVoucher()
    },
  }

  const genApi = () => {
    switch (nodeType) {
      case CryptoCoreType.Crypto: {
        return createRequestHandler<CryptoWorkerApi>(cryptoApiHandlers)
      }
    }
    return createRequestHandler<WorkerApi>(baseApiHandlers)
  }

  try {
    const jsonRpcRequest: JsonRpcRequest = await request.json()
    const jsonRpcResponse: JsonRpcResponse = await genApi().handleRequest(
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
