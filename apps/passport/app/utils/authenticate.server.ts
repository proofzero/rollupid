import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN
) => {
  const accessClient = getAccessClient()

  const clientId = address
  const redirectUri = PASSPORT_REDIRECT_URL
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
  const { accessToken } = await accessClient.exchangeToken.mutate(
    {
      grantType,
      account,
      code,
      redirectUri,
      clientId,
    }
  )

  const redirectURL = '/authorize'
  return createUserSession(accessToken, redirectURL, address)
}
