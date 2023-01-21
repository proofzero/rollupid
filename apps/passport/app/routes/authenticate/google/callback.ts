import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import { authenticator, getGoogleAuthenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const rollupEncoding = searchParams.get('rollup')

  if (!rollupEncoding) throw new Error('Missing rollup encoding.')

  const appData = JSON.parse(decodeURIComponent(rollupEncoding))

  authenticator.use(getGoogleAuthenticator())

  const authRes = (await authenticator.authenticate(
    GoogleStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider !== OAuthAddressType.Google)
    throw new Error('Unsupported provider returned in Google callback.')

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.Google, profile._json.email),
    { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Google },
    { alias: profile._json.email, hidden: 'true' }
  )
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData)
}
