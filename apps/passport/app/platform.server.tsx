import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { ScopeMeta } from './components/authorization/Authorization'
import { GraphQLClient } from 'graphql-request'
import { getSdk } from '~/galaxy.server'

export function getStarbaseClient() {
  return createFetcherJsonRpcClient(Starbase)
}

export function getAccessClient() {
  return createFetcherJsonRpcClient(Access)
}

export function getAddressClient(addressUrn: string) {
  const requestInit: RequestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  return createFetcherJsonRpcClient(Address, requestInit)
}
export function getAddressClientFromURN(addressUrn: string) {
  const requestInit: RequestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  return createFetcherJsonRpcClient(Address, requestInit)
}

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}
