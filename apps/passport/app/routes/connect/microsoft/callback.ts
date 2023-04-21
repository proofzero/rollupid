import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'
import { initAuthenticator, getMicrosoftStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'
import type { OAuthData } from '@proofzero/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticateAddress } from '~/utils/authenticate.server'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '~/session.server'
import cacheImageToCF from '~/utils/cacheImageToCF.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const appData = await getConsoleParams(request, context.env)

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
    { alias: profile.emails[0]?.value || profile._json.email, hidden: 'true' }
  )

  const addressClient = getAddressClient(
    address,
    context.env,
    context.traceSpan
  )
  await addressClient.setOAuthData.mutate(authRes)

  const { accountURN, existing } = await addressClient.resolveAccount.query({
    jwt: await getJWTConditionallyFromSession(
      request,
      context.env,
      appData?.clientId
    ),
    force: !appData || appData.prompt !== 'connect',
  })

  return authenticateAddress(
    address,
    accountURN,
    appData,
    request,
    context.env,
    context.traceSpan,
    existing
  )
}

export default () => { }
