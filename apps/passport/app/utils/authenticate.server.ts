import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'
import { Session } from '@remix-run/cloudflare'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  authorizeSession: Session
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
  const { accessToken } = await accessClient.exchangeToken.mutate({
    grantType,
    account,
    code,
    redirectUri,
    clientId,
  })

  const authAppId = authorizeSession.get('clientId')
  const authRedirectUri = authorizeSession.get('redirectUri')
  const authState = authorizeSession.get('state')
  const authScope = authorizeSession.get('scope')

  const redirectURL = `/authorize?client_id=${authAppId}&redirect_uri=${authRedirectUri}&state=${authState}&scope=${authScope}`
  return createUserSession(accessToken, redirectURL, address)
}
