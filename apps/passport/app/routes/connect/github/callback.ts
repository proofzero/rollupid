import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'

import {
  getGithubAuthenticator,
  createAuthenticatorSessionStorage,
} from '~/auth.server'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'

import { getAddressClient } from '~/platform.server'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'
import type { OAuthData } from '@proofzero/platform.address/src/types'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: LoaderArgs) => {
    await checkOAuthError(request, context.env)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorSession = createAuthenticatorSessionStorage(context.env)
    const authenticator = new Authenticator(authenticatorSession)
    authenticator.use(getGithubAuthenticator(context.env))

    const authRes = (await authenticator.authenticate(
      GitHubStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes

    if (profile.provider !== OAuthAddressType.GitHub)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Github callback.',
      })

    if (!profile._json?.login)
      throw new InternalServerError({
        message: 'Could not get Github login info.',
      })

    const address = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.GitHub, profile.id),
      { node_type: NodeType.OAuth, addr_type: OAuthAddressType.GitHub },
      { alias: profile._json.login, hidden: 'true' }
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
