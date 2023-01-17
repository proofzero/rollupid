import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'

import { authenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { keccak256 } from 'ethers/lib/utils'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    GitHubStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider != OAuthAddressType.GitHub) {
    throw new Error('unrecognized profile provider')
  }

  const idref = IDRefURNSpace(OAuthAddressType.GitHub).urn(profile.id)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${NodeType.OAuth}&addr_type=${OAuthAddressType.GitHub}?=alias=${profile._json?.login}&hidden=true`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)
  return authenticateAddress(address, account)
}
