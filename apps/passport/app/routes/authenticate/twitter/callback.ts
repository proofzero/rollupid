import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { TwitterStrategyDefaultName } from 'remix-auth-twitter'
import type { TwitterStrategyVerifyParams } from 'remix-auth-twitter'

import { NodeType, OAuthAddressType } from '@kubelt/types/address'

import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'

import { initAuthenticator, getTwitterStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const rollupEncoding = searchParams.get('rollup')

  if (!rollupEncoding) throw new Error('Missing rollup encoding.')

  const appData = JSON.parse(decodeURIComponent(rollupEncoding))

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
  const addressClient = getAddressClient(address, context.env)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate({
    accessToken,
    accessTokenSecret,
    profile: { ...profile, provider: OAuthAddressType.Twitter },
  })

  return authenticateAddress(address, account, appData, context.env)
}
