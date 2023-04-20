import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { TwitterStrategyDefaultName } from 'remix-auth-twitter'
import type { TwitterStrategyVerifyParams } from 'remix-auth-twitter'

import { NodeType, OAuthAddressType } from '@proofzero/types/address'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'

import { initAuthenticator, getTwitterStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '~/session.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const appData = await getConsoleParams(request, context.env)

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getTwitterStrategy(context.env))

  const { accessToken, accessTokenSecret, profile } =
    (await authenticator.authenticate(
      TwitterStrategyDefaultName,
      request
    )) as TwitterStrategyVerifyParams

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.Twitter, profile.id_str),
    { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Twitter },
    { alias: profile.name, hidden: 'true' }
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
    force: !appData || appData.prompt !== 'connect',
  })

  await addressClient.setOAuthData.mutate({
    accessToken,
    accessTokenSecret,
    profile: { ...profile, provider: OAuthAddressType.Twitter },
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

export default () => {}
