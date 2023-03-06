import type { LoaderFunction } from '@remix-run/cloudflare'
import { DiscordStrategyDefaultName } from 'remix-auth-discord'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'

import type { OAuthData } from '@kubelt/platform.address/src/types'

import { initAuthenticator, getDiscordStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch(() => null)

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
    jwt: await getJWTConditionallyFromSession(request, context.env),
  })

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(
    address,
    accountURN,
    appData,
    context.env,
    context.traceSpan,
    existing
  )
}

export default () => {}
