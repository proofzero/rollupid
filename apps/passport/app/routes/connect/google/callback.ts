import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import {
  createAuthenticatorSessionStorage,
  getGoogleAuthenticator,
} from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'
import type { OAuthData } from '@proofzero/platform.address/src/types'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: LoaderArgs) => {
    await checkOAuthError(request, context.env)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorStorage = createAuthenticatorSessionStorage(context.env)
    const authenticator = new Authenticator(authenticatorStorage)
    authenticator.use(getGoogleAuthenticator(context.env))

    const authRes = (await authenticator.authenticate(
      GoogleStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes

    if (profile.provider !== OAuthAddressType.Google)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Google callback.',
      })

    const address = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.Google, profile._json.email),
      { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Google },
      { alias: profile._json.email, hidden: 'true' }
    )
    const addressClient = getAddressClient(
      address,
      context.env,
      context.traceSpan
    )

    const { accountURN, existing } = await addressClient.resolveAccount.query({
      jwt: await getUserSession(request, context.env, appData?.clientId),
      force: !appData || appData.rollup_action !== 'connect',
    })

    await addressClient.setOAuthData.mutate(authRes)

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
)

export default () => {}
