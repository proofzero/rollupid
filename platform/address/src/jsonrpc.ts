import { error } from 'itty-router-extras'
import {
  createRequestHandler,
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
import { URN } from '@kubelt/security'

import { ADDRESS_OPTIONS } from './constants'
import {
  Environment,
  AddressCoreApi,
  CryptoCoreApi,
  WorkerApi,
  CryptoWorkerApi,
  CryptoAddressType,
  AddressProfile,
} from './types'
import { resolve3RN } from './utils'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, Core, Oort } = env

  // proto middleware for all requests
  //--------------------------------------------------------------------------------

  // validate 3RN
  const { address, type } = await resolve3RN(request)
  // TODO: JWT validation

  // create client
  const core = Core.get(Core.idFromName(address))
  const client = createFetcherJsonRpcClient(core)

  // first time setup
  if (
    !(await (client as AddressCoreApi).getAddress()) ||
    !(await (client as AddressCoreApi).getType())
  ) {
    console.log('first time setup')
    const namePromise = (client as AddressCoreApi).setAddress(address)
    const typePromise = (client as AddressCoreApi).setType(type)
    await Promise.all([namePromise, typePromise])
  }
  //--------------------------------------------------------------------------------

  const baseApiHandlers: WorkerApi = {
    async kb_setAccount(accountUrn: string): Promise<void> {
      return (client as AddressCoreApi).setAccount(accountUrn)
    },
    async kb_unsetAccount(): Promise<void> {
      return (client as AddressCoreApi).kb_unsetAddress()
    },
    async kb_resolveAccount(): Promise<string | undefined> {
      return await (client as AddressCoreApi).resolveAccount()
    },
  }

  const cryptoApiHandlers: CryptoWorkerApi = {
    ...baseApiHandlers,
    // TODO: function to be deprecated pass support period for oort migration
    async kb_resolveAccount(): Promise<string> {
      let account = await (client as CryptoCoreApi).resolveAccount()
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
      return (client as CryptoCoreApi).getNonce(
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
      const account = await this.kb_resolveAccount()
      if (!account) {
        throw 'missing account'
      }
      const challenge = await client.verifyNonce(nonce, signature)
      const { clientId, redirectUri, scope, state } = challenge
      const accessClient = createFetcherJsonRpcClient<AccessApi>(Access)

      const accountUrn = URN.generateUrn(
        'account',
        URN.DEFAULT_DOMAIN,
        'account',
        { [URN.DESCRIPTOR.NAME]: account, [URN.DESCRIPTOR.TYPE]: 'account' }
      )

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
      return (client as CryptoCoreApi).setProfile(profile)
    },
    async kb_getAddressProfile(): Promise<AddressProfile | undefined> {
      return (client as CryptoCoreApi).getProfile()
    },
    async kb_getPfpVoucher(): Promise<object | undefined> {
      return (client as CryptoCoreApi).getPfpVoucher()
    },
  }

  const genApi = () => {
    switch (type) {
      case CryptoAddressType.ETHEREUM:
      case CryptoAddressType.ETH: {
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
