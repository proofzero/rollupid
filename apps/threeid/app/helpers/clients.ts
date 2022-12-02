import { GraphQLClient } from 'graphql-request'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { CryptoWorkerApi } from '@kubelt/platform.address/src/types'
import { getSdk } from '~/utils/galaxy.server'

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}

export function getCryptoAddressClient(options: RequestInit) {
  return createFetcherJsonRpcClient<CryptoWorkerApi>(Address, options)
}
