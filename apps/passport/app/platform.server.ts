import { getSdk } from '@kubelt/galaxy-client'
import createAccessClient from '@kubelt/platform-clients/access'
import createAddressClient from '@kubelt/platform-clients/address'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import { GraphQLClient } from 'graphql-request'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

export function getStarbaseClient(jwt: string, env: Env) {
  return createStarbaseClient(env.Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })
}

export function getAccessClient(env: Env) {
  return createAccessClient(env.Access)
}

export function getAddressClient(addressUrn: string, env: Env) {
  const requestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  console.log({ env })
  return createAddressClient(env.Address, requestInit)
}

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}
