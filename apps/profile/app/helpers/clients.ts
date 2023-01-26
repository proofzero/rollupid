import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@kubelt/galaxy-client'
import createAddressClient from '@kubelt/platform-clients/address'
import { ClientOptions } from '@kubelt/platform-clients/types'

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}

export function getCryptoAddressClient(options: ClientOptions) {
  return createAddressClient(Address, options)
}
