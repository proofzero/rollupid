import type { LoaderFunction } from '@remix-run/cloudflare'
import { DiscordStrategyDefaultName } from 'remix-auth-discord'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'

import type { OAuthData } from '@proofzero/platform.address/src/types'

import { initAuthenticator, getDiscordStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const appData = await getConsoleParams(request, context.env)

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getDiscordStrategy(context.env))

  const authRes = (await authenticator.authenticate(
    DiscordStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider !== OAuthAddressType.Discord)
    throw new Error('Unsupported provider returned in Discord callback.')

  if (!profile.__json.id) throw new Error('Could not get Discord login info.')

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.Discord, profile.__json.id),
    { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Discord },
    { alias: profile.__json.email, hidden: 'true' }
  )
  const addressClient = getAddressClient(
    address,
    context.env,
    context.traceSpan
  )
  const { accountURN, existing } = await addressClient.resolveAccount.query({
    jwt: await getJWTConditionallyFromSession(
      request,
      context.env,
      appData?.clientId
    ),
    force: !appData || appData.prompt !== 'login',
  })

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(
    request,
    address,
    accountURN,
    appData,
    context.env,
    context.traceSpan,
    existing
  )
}

export default () => {}
