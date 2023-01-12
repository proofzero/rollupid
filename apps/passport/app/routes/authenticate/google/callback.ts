import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import type { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'

import { keccak256 } from '@ethersproject/keccak256'

import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'

import { OAuthAddressType } from '@kubelt/types/address'

import { authenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { OAuthData } from '@kubelt/platform.address/src/types'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    'google',
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider != OAuthAddressType.Google) {
    throw new Error('unrecognized profile provider')
  }

  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(profile._json.email))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=oauth&addr_type=google?=alias=${profile._json.email}`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account)
}
