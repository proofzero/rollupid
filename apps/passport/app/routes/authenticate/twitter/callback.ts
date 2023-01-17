import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { TwitterStrategyDefaultName } from 'remix-auth-twitter'
import type { TwitterStrategyVerifyParams } from 'remix-auth-twitter'

import { keccak256 } from '@ethersproject/keccak256'

import { NodeType, OAuthAddressType } from '@kubelt/types/address'

import { AddressURNSpace } from '@kubelt/urns/address'
import type { AddressURN } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'

import { authenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const { accessToken, accessTokenSecret, profile } =
    (await authenticator.authenticate(
      TwitterStrategyDefaultName,
      request
    )) as TwitterStrategyVerifyParams

  const idref = IDRefURNSpace(OAuthAddressType.Twitter).urn(profile.id_str)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${NodeType.OAuth}&addr_type=${OAuthAddressType.Twitter}?=alias=${profile.name}&hidden=true`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate({
    accessToken,
    accessTokenSecret,
    profile: { ...profile, provider: OAuthAddressType.Twitter },
  })

  return authenticateAddress(address, account)
}
