import { getSdk } from '@kubelt/galaxy-client'
import createAccessClient from '@kubelt/platform-clients/access'
import createAddressClient from '@kubelt/platform-clients/address'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import type { ScopeMeta } from './components/authorization/Authorization'
import { GraphQLClient } from 'graphql-request'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

export function getStarbaseClient(jwt: string) {
  return createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })
}

export function getAccessClient() {
  return createAccessClient(Access)
}

export function getAddressClient(addressUrn: string) {
  const requestInit: RequestInit = {
    headers: {
      'X-3RN': addressUrn,
    },
  }
  return createAddressClient(Address, requestInit)
}

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}
