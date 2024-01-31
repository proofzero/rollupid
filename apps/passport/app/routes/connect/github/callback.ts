import { redirect } from '@remix-run/cloudflare'
import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AccountURNSpace } from '@proofzero/urns/account'

import {
  getGithubAuthenticator,
  createAuthenticatorSessionStorage,
} from '~/auth.server'
import {
  authenticateAccount,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { redirectToCustomDomainHost } from '~/utils/connect-proxy'

import { getCoreClient } from '~/platform.server'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAccountType } from '@proofzero/types/account'
import type { OAuthData } from '@proofzero/platform.account/src/types'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: LoaderArgs) => {
    await checkOAuthError(request, context.env)
    await redirectToCustomDomainHost(request, context)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorSession = createAuthenticatorSessionStorage(
      request,
      context.env
    )
    const authenticator = new Authenticator(authenticatorSession)
    authenticator.use(getGithubAuthenticator(context.env))

    const authRes = (await authenticator.authenticate(
      GitHubStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes

    if (profile.provider !== OAuthAccountType.GitHub)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Github callback.',
      })

    if (!profile._json?.login)
      throw new InternalServerError({
        message: 'Could not get Github login info.',
      })

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAccountType.GitHub, profile.id),
      { node_type: NodeType.OAuth, addr_type: OAuthAccountType.GitHub },
      { alias: profile._json.login, hidden: 'true' }
    )
    const coreClient = getCoreClient({ context, accountURN })
    const { identityURN, existing } =
      await coreClient.account.resolveIdentity.query({
        jwt: await getUserSession(request, context.env, appData?.clientId),
        force:
          !appData ||
          (appData.rollup_action !== 'connect' &&
            !appData.rollup_action?.startsWith('groupconnect')),
        clientId: appData?.clientId,
      })

    await coreClient.account.setOAuthData.mutate(authRes)

    return authenticateAccount(
      accountURN,
      identityURN,
      appData,
      request,
      context.env,
      context.traceSpan,
      existing
    )
  }
)

export default () => {}
