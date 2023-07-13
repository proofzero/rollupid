import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'
import {
  createAuthenticatorSessionStorage,
  getMicrosoftStrategy,
} from '~/auth.server'
import { getCoreClient } from '~/platform.server'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'
import type { OAuthData } from '@proofzero/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { redirectToCustomDomainHost } from '~/utils/connect-proxy'

import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: LoaderArgs) => {
    await checkOAuthError(request, context.env)
    await redirectToCustomDomainHost(request, context)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorStorage = createAuthenticatorSessionStorage(
      request,
      context.env
    )
    const authenticator = new Authenticator(authenticatorStorage)
    authenticator.use(getMicrosoftStrategy(context.env))

    const authRes = (await authenticator.authenticate(
      MicrosoftStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes
    if (profile.provider !== OAuthAddressType.Microsoft)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Microsoft callback.',
      })

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.Microsoft, profile.id),
      { addr_type: OAuthAddressType.Microsoft, node_type: NodeType.OAuth },
      { alias: profile.emails[0]?.value || profile._json.email, hidden: 'true' }
    )

    const coreClient = getCoreClient({ context, addressURN })
    await coreClient.address.setOAuthData.mutate(authRes)

    const { accountURN, existing } =
      await coreClient.address.resolveAccount.query({
        jwt: await getUserSession(request, context.env, appData?.clientId),
        force: !appData || appData.rollup_action !== 'connect',
      })

    return authenticateAddress(
      addressURN,
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
