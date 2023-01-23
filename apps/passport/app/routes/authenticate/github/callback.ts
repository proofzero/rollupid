import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'

import { initAuthenticator, getGithubAuthenticator } from '~/auth.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { getAddressClient } from '~/platform.server'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const rollupEncoding = searchParams.get('rollup')

  if (!rollupEncoding) throw new Error('Missing rollup encoding.')

  const appData = JSON.parse(decodeURIComponent(rollupEncoding))

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getGithubAuthenticator(context.env))

  const authRes = (await authenticator.authenticate(
    GitHubStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider !== OAuthAddressType.GitHub)
    throw new Error('Unsupported provider returned in Github callback.')

  if (!profile._json?.login) throw new Error('Could not get Github login info.')

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.GitHub, profile.id),
    { node_type: NodeType.OAuth, addr_type: OAuthAddressType.GitHub },
    { alias: profile._json.login, hidden: 'true' }
  )
  const addressClient = getAddressClient(address, context.env)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData, context.env)
}
