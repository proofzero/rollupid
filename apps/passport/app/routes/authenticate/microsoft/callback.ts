import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { authenticator } from '~/auth.server'
import { getAddressClient, getAccessClient } from '~/platform.server'
import { keccak256 } from '@ethersproject/keccak256'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticateAddress } from '~/utils/authenticate.server'
import cacheImageToCF from '~/utils/cacheImageToCF.server'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    MicrosoftStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes
  if (profile.provider !== OAuthAddressType.Microsoft)
    throw new Error('Unsupported provider returned in Microsoft callback.')

  const idref = IDRefURNSpace(OAuthAddressType.Microsoft).urn(profile.id)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${NodeType.OAuth}&addr_type=${OAuthAddressType.Microsoft}`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()
  const existingOAuthData = await addressClient.getOAuthData.query()

  if (existingOAuthData?.profile == null) {
    //If we don't already have a microsoft oauth data set, we cache
    //the image and set the OAuth data set for the address
    const imageUrl = await cacheImageToCF(profile._json.picture, {
      Authorization: `Bearer ${authRes.accessToken}`,
    })
    profile._json.threeidImageUrl = imageUrl

    await addressClient.setOAuthData.mutate(authRes)
  }

  return authenticateAddress(address, account)
}
