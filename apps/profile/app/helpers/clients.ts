import { GraphQLClient } from 'graphql-request'
import { getSdk } from '@proofzero/galaxy-client'
import { TRACEPARENT_HEADER_NAME } from '@proofzero/platform-middleware/trace'
import { PlatformHeaders } from '@proofzero/platform-clients/base'

export async function getGalaxyClient(reqHeaders: PlatformHeaders, env: Env) {
  const traceparent = JSON.stringify({
    traceparent: reqHeaders ? reqHeaders[TRACEPARENT_HEADER_NAME] : '',
  })
  const gqlClient = new GraphQLClient('http://127.0.0.1/graphql', {
    // @ts-ignore
    fetch: env.Galaxy.fetch.bind(env.Galaxy),
    requestMiddleware: (r) => {
      r.headers = { ...reqHeaders, ...(r.headers as Record<string, string>) }
      console.debug(`Starting GQL client request.`, traceparent)
      return r
    },
    responseMiddleware(response) {
      console.debug(`Completed GQL request.`, traceparent)
    },
  })
  return getSdk(gqlClient)
}
