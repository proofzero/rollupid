import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import { initAuthenticator, getGoogleAuthenticator } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import type { OAuthData } from '@kubelt/platform.address/src/types'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { getConsoleParamsSession } from '~/session.server'

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
  authenticator.use(getGoogleAuthenticator(context.env))

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
  const addressClient = await getAddressClient(address, context.env, request)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData, context.env)
}

export default () => {}
