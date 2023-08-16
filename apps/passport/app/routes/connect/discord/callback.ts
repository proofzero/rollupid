import type { LoaderFunction } from '@remix-run/cloudflare'
import { DiscordStrategyDefaultName } from 'remix-auth-discord'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AccountURNSpace } from '@proofzero/urns/account'
import { NodeType, OAuthAccountType } from '@proofzero/types/account'

import type { OAuthData } from '@proofzero/platform.account/src/types'

import {
  createAuthenticatorSessionStorage,
  getDiscordStrategy,
} from '~/auth.server'
import { getCoreClient } from '~/platform.server'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import {
  authenticateAccount,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { redirectToCustomDomainHost } from '~/utils/connect-proxy'

import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await checkOAuthError(request, context.env)
    await redirectToCustomDomainHost(request, context)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorStorage = createAuthenticatorSessionStorage(
      request,
      context.env
    )
    const authenticator = new Authenticator(authenticatorStorage)
    authenticator.use(getDiscordStrategy(context.env))

    const authRes = (await authenticator.authenticate(
      DiscordStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes

    if (profile.provider !== OAuthAccountType.Discord)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Discord callback.',
      })

    if (!profile.__json.id)
      throw new InternalServerError({
        message: 'Could not get Discord login info.',
      })

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAccountType.Discord, profile.__json.id),
      { node_type: NodeType.OAuth, addr_type: OAuthAccountType.Discord },
      { alias: profile.__json.email, hidden: 'true' }
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
