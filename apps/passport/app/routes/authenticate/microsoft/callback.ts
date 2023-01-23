import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'
import { initAuthenticator, getMicrosoftStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticateAddress } from '~/utils/authenticate.server'
import { getConsoleParamsSession } from '~/session.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found', err)
      return null
    })

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getMicrosoftStrategy(context.env))

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

  const addressClient = getAddressClient(address, context.env)

  const account = await addressClient.resolveAccount.query()

  const existingOAuthData = await addressClient.getOAuthData.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData, context.env)
}
