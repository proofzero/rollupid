import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@proofzero/galaxy-client'
import { TRACEPARENT_HEADER_NAME } from '@proofzero/platform-middleware/trace'
import { PlatformHeaders } from '@proofzero/platform-clients/base'

export async function getGalaxyClient(reqHeaders: PlatformHeaders) {
  const traceparent = reqHeaders ? reqHeaders[TRACEPARENT_HEADER_NAME] : ''
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
    requestMiddleware: (r) => {
      r.headers = { ...reqHeaders, ...(r.headers as Record<string, string>) }
      console.debug(`Starting GQL client request. Traceparent: ${traceparent}`)
      return r
    },
    responseMiddleware(response) {
      console.debug(`Completed GQL request. Traceparent: ${traceparent}`)
    },
  })
  return getSdk(gqlClient)
}
