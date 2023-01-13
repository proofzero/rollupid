import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { authenticator } from '~/auth.server'
import { getAddressClient, getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'
import { keccak256 } from 'ethers/lib/utils'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  console.debug("Start of github loader")
  const authRes = (await authenticator.authenticate(
    GitHubStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  const idref = IDRefURNSpace(OAuthAddressType.GitHub).urn(profile.id)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${ NodeType.OAuth }&addr_type=${ OAuthAddressType.GitHub}`) as AddressURN
  console.debug(address)
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()
    
  await addressClient.setOAuthData.mutate(authRes)
  console.debug("github loader before authenticateADdress")
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

  console.debug("authenicateAddress, before authorize")
  const redirectURL = '/authorize'
  return createUserSession(accessToken, redirectURL, address)
}
