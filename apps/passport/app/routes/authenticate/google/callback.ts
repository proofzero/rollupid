import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import type { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'

import { keccak256 } from '@ethersproject/keccak256'

import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { authenticator } from '~/auth.server'
import { getAddressClient, getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'

type AuthenticationResult = {
  accessToken: string
  refreshToken: string
  extraParams: GoogleExtraParams
  profile: GoogleProfile
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    'google',
    request
  )) as AuthenticationResult

  const { profile } = authRes

  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(profile._json.email))
  const address = (AddressURNSpace.urn(hash) +
    '?+node_type=oauth&addr_type=google') as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account)
}

const authenticateAddress = async (
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
  const { accessToken, refreshToken } = await accessClient.exchangeToken.mutate(
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
