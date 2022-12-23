import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import type { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'

import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { authenticator } from '~/auth.server'
import { getAddressClient, getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'
import { keccak256 } from 'ethers/lib/utils'

type AuthenticationResult = {
  accessToken: string,
  refreshToken: string,
  extraParams: GoogleExtraParams,
  profile: GoogleProfile,
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const {
    accessToken,
    refreshToken,
    extraParams,
    profile,
  } = await authenticator.authenticate('google', request) as AuthenticationResult

  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(profile._json.email))
  const address = AddressURNSpace.urn(hash) + '?+node_type=oauth?=addr_type=google' as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.kb_resolveAccount()

  const { email } = profile._json
  await addressClient.kb_setData({ accessToken, refreshToken, email, extraParams, profile })

  await addressClient.kb_setAddressProfile({
    displayName: profile._json.name,
    pfp: {
      image: profile._json.picture,
      isToken: false,
    }
  })

  return authenticateAddress(address, account)
}

const authenticateAddress = async (address: AddressURN, account: AccountURN) => {
  const accessClient = getAccessClient()

  const clientId = address
  const redirectUri = PASSPORT_REDIRECT_URL
  const scope = ['admin']
  const state = ''
  const { code } = await accessClient.kb_authorize(account, ResponseType.Code, clientId, redirectUri, scope, state)

  const grantType = GrantType.AuthenticationCode
  const { accessToken, refreshToken } = await accessClient.kb_exchangeToken(
    grantType,
    account,
    code,
    redirectUri,
    clientId
  )

  const redirectURL = '/authorize'
  return createUserSession(accessToken, redirectURL, address)
}
