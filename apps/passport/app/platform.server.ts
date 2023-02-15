import { getSdk } from '@kubelt/galaxy-client'
import createAccessClient from '@kubelt/platform-clients/access'
import createAddressClient from '@kubelt/platform-clients/address'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import { GraphQLClient } from 'graphql-request'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { getUserSession } from './session.server'

export function getStarbaseClient(jwt: string, env: Env) {
  return createStarbaseClient(
    env.Starbase,
    getAuthzHeaderConditionallyFromToken(jwt)
  )
}

export function getAccessClient(env: Env) {
  return createAccessClient(env.Access)
}

export async function getAddressClient(
  addressUrn: string,
  env: Env,
  request?: Request
) {
  let jwt
  if (request) {
    const userSession = await getUserSession(request, env)
    jwt = userSession.get('jwt')
  }

  return createAddressClient(env.Address, {
    [PlatformAddressURNHeader]: addressUrn,
    ...getAuthzHeaderConditionallyFromToken(jwt),
  })
}

export async function getGalaxyClient() {
  const gqlClient = new GraphQLClient('http://127.0.0.1', {
    // @ts-ignore
    fetch: Galaxy.fetch.bind(Galaxy),
  })
  return getSdk(gqlClient)
}
