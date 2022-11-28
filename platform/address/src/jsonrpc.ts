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
import {
  Environment,
  AddressCoreApi,
  CryptoCoreApi,
  WorkerApi,
  CryptoWorkerApi,
  AddressProfile,
  CryptoCoreType,
} from './types'
import { resolve3RN } from './utils'
import { default as CryptoCoreStatic } from './crypto-core'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, CryptoCore, Oort } = env

  // proto middleware for all requests
  //--------------------------------------------------------------------------------

  // TODO: JWT validation

  // validate 3RN
  const { coreType, addressType, name, params } = await resolve3RN(request)

  // route to correct DO
  let core = null
  let client: JsonRpcClient<AddressCoreApi | CryptoCoreApi>
  let address: string

  if (!name) {
    throw new Error('missing 3RN name query parameter')
  }

  switch (coreType) {
    case CryptoCoreType.Crypto:
      {
        const ens = params.get('ens') as string
        address = await CryptoCoreStatic.validateAddress(
          name || ens,
          addressType
        )
        core = CryptoCore.get(CryptoCore.idFromName(address)) // TODO: change to crypto core DO
        client = createFetcherJsonRpcClient<CryptoCoreApi>(core)
      }
      break
    default: // TODO: change to crypto core DO
      throw 'invalid core type'
  }

  // first time setup
  if (!(await client.getAddress()) || !(await client.getType())) {
    console.log('first time setup')
    const namePromise = client.setAddress(address)
    const typePromise = client.setType(addressType)
    await Promise.all([namePromise, typePromise])
  }
  //--------------------------------------------------------------------------------

  const baseApiHandlers: WorkerApi = {
    async kb_setAccount(accountUrn: string): Promise<void> {
      return client.setAccount(accountUrn)
    },
    async kb_unsetAccount(): Promise<void> {
      return client.kb_unsetAddress()
    },
    async kb_resolveAccount(): Promise<string | undefined> {
      return await client.resolveAccount()
    },
  }

  const cryptoApiHandlers: CryptoWorkerApi = {
    ...baseApiHandlers,
    // TODO: function to be deprecated pass support period for oort migration
    async kb_resolveAccount(): Promise<string> {
      let account = await client.resolveAccount()
      if (account) {
        return account
      } else {
        const response = await Oort.fetch(`http://localhost/address/${address}`)
        if (response.ok) {
          // if oort has an account we can also assume it has a profile
          const { coreId: accountId }: { coreId: string } =
            await response.json()
          account = accountId
        } else {
          account = hexlify(randomBytes(ADDRESS_OPTIONS.length))
        }

        await client.setAccount(account)
        return account
      }
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
      const account = await this.kb_resolveAccount()
      if (!account) {
        throw 'missing account'
      }
      const challenge = await client.verifyNonce(nonce, signature)
      const { clientId, redirectUri, scope, state } = challenge
      const accessClient = createFetcherJsonRpcClient<AccessApi>(Access)

      const accountUrn = `urn:threeid:account?=name=${account}&type=account`

      return accessClient.kb_authorize(
        accountUrn,
        clientId,
        redirectUri,
        scope,
        state,
        ResponseType.Code
      )
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
    switch (coreType) {
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
