import { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'

import { initAuthenticator, getGithubAuthenticator } from '~/auth.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { getAddressClient } from '~/platform.server'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import type { OAuthData } from '@kubelt/platform.address/src/types'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found')
      return null
    })

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
  const account = await addressClient.resolveAccount.query({
    jwt: await getJWTConditionallyFromSession(request, context.env),
  })

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData, context.env)
}

export default () => {}
