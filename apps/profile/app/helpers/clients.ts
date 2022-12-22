import { GraphQLClient } from 'graphql-request'
import createAddressClient from '@kubelt/platform-clients/address'
import { getSdk } from '~/utils/galaxy.server'

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}

export function getCryptoAddressClient(
  options: RequestInit<RequestInitCfProperties>
) {
  return createAddressClient(Address, options)
}
