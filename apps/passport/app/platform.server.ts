import createAccessClient from '@kubelt/platform-clients/access'
import createAddressClient from '@kubelt/platform-clients/address'
import createAccountClient from '@kubelt/platform-clients/account'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

export function getStarbaseClient(jwt: string, env: Env) {
  return createStarbaseClient(
    env.Starbase,
    getAuthzHeaderConditionallyFromToken(jwt)
  )
}

export function getAccessClient(env: Env) {
  return createAccessClient(env.Access)
}

export function getAddressClient(addressUrn: string, env: Env) {
  return createAddressClient(env.Address, {
    [PlatformAddressURNHeader]: addressUrn,
  })
}

export function getAccountClient(jwt: string, env: Env) {
  return createAccountClient(
    env.Account,
    getAuthzHeaderConditionallyFromToken(jwt)
  )
}
