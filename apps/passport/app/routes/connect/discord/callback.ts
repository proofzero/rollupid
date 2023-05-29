import type { LoaderFunction } from '@remix-run/cloudflare'
import { DiscordStrategyDefaultName } from 'remix-auth-discord'

import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNSpace } from '@proofzero/urns/address'
import { NodeType, OAuthAddressType } from '@proofzero/types/address'

import type { OAuthData } from '@proofzero/platform.address/src/types'

import {
  createAuthenticatorSessionStorage,
  getDiscordStrategy,
} from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await checkOAuthError(request, context.env)

    const appData = await getAuthzCookieParams(request, context.env)

    const authenticatorStorage = createAuthenticatorSessionStorage(context.env)
    const authenticator = new Authenticator(authenticatorStorage)
    authenticator.use(getDiscordStrategy(context.env))

    const authRes = (await authenticator.authenticate(
      DiscordStrategyDefaultName,
      request
    )) as OAuthData

    const { profile } = authRes

    if (profile.provider !== OAuthAddressType.Discord)
      throw new InternalServerError({
        message: 'Unsupported provider returned in Discord callback.',
      })

    if (!profile.__json.id)
      throw new InternalServerError({
        message: 'Could not get Discord login info.',
      })

    const address = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.Discord, profile.__json.id),
      { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Discord },
      { alias: profile.__json.email, hidden: 'true' }
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
