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
import { resolveAddress3RN } from './utils'
import { default as CryptoCoreStatic } from './crypto-core'
import { AccountURN } from '../../account/src/types'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, CryptoCore, Oort } = env

  // proto middleware for all requests
  //--------------------------------------------------------------------------------

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

      const accountUrn = `urn:threeid:account/${account}?+node_type=account`

      return accessClient.kb_authorize(
        accountUrn as AccountURN,
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
