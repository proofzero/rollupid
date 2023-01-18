import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import type { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'

import { keccak256 } from '@ethersproject/keccak256'

import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'

import { authenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    'google',
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider !== OAuthAddressType.Google)
    throw new Error('Unsupported provider returned in Google callback.')

  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(profile._json.email))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${NodeType.OAuth}&addr_type=${OAuthAddressType.Google}?=alias=${profile._json.email}&hidden=true`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account)
}
