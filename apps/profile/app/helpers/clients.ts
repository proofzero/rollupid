import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@kubelt/galaxy-client'

export async function getGalaxyClient(reqHeaders?: Record<string, string>) {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
    requestMiddleware: (r) => {
      r.headers = { ...reqHeaders, ...(r.headers as Record<string, string>) }
      //TODO: remove once tested
      console.debug('GALAXY REQUEST', JSON.stringify(r.headers))
      return r
    },
  })
  return getSdk(gqlClient)
}
