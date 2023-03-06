import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@kubelt/galaxy-client'
import { TRACEPARENT_HEADER_NAME } from '@kubelt/platform-middleware/trace'
import { PlatformHeaders } from '@kubelt/platform-clients/base'

export async function getGalaxyClient(reqHeaders: PlatformHeaders) {
  const traceparent = reqHeaders ? reqHeaders[TRACEPARENT_HEADER_NAME] : ''
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
    requestMiddleware: (r) => {
      r.headers = { ...reqHeaders, ...(r.headers as Record<string, string>) }
      console.debug(`Starting GQL request ${traceparent}`)
      return r
    },
    responseMiddleware(response) {
      console.debug(`Completed GQL request ${traceparent}`)
    },
  })
  return getSdk(gqlClient)
}
