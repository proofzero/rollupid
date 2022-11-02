import { GraphQLClient } from 'graphql-request'
import { getSdk } from '~/utils/galaxy.server'

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: GALAXY.fetch.bind(GALAXY),
  })
  return getSdk(gqlClient)
}
