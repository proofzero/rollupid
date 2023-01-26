import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  appData: {
    clientId: string
    redirectUri: string
    state: string
    scope: string
  } | null,
  env: Env
) => {
  const accessClient = getAccessClient(env)

  const clientId = address
  const redirectUri = env.PASSPORT_REDIRECT_URL
  const scope = ['admin']
  const state = ''
  const { code } = await accessClient.authorize.mutate({
    account,
    responseType: ResponseType.Code,
    clientId,
    redirectUri,
    scope,
    state,
  })

  const grantType = GrantType.AuthenticationCode
  const { accessToken } = await accessClient.exchangeToken.mutate({
    grantType,
    code,
    clientId,
  })

  let redirectURL = '/authorize'
  if (appData) {
    const authAppId = appData.clientId
    const authRedirectUri = appData.redirectUri
    const authState = appData.state
    const authScope = appData.scope
    const urlParams = new URLSearchParams({
      client_id: authAppId,
      redirect_uri: authRedirectUri,
      state: authState,
      scope: authScope,
    })

    redirectURL += `?${urlParams}`
  }

  return createUserSession(accessToken, redirectURL, address, env)
}
