import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { GraphQLClient } from 'graphql-request'
import { getSdk } from './galaxy.server'


export function getStarbaseClient(jwt: string): StarbaseClient {
  return createStarbaseClient(Starbase, {
    headers: {
      'KBT-Access-JWT-Assertion': jwt,
    },
  })
}

export type StarbaseClient = ReturnType<typeof createStarbaseClient>

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}
