import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'
import { authenticator, getMicrosoftStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const rollupEncoding = searchParams.get('rollup')

  if (!rollupEncoding) throw new Error('Missing rollup encoding.')

  const appData = JSON.parse(decodeURIComponent(rollupEncoding))

  authenticator.use(getMicrosoftStrategy())

  const authRes = (await authenticator.authenticate(
    MicrosoftStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes
  if (profile.provider !== OAuthAddressType.Microsoft)
    throw new Error('Unsupported provider returned in Microsoft callback.')

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.Microsoft, profile.id),
    { addr_type: OAuthAddressType.Microsoft, node_type: NodeType.OAuth },
    { alias: profile.displayName, hidden: 'true' }
  )

  const addressClient = getAddressClient(address)

  const account = await addressClient.resolveAccount.query()

  const existingOAuthData = await addressClient.getOAuthData.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData)
}
