import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { TwitterStrategyDefaultName } from 'remix-auth-twitter'
import type { TwitterStrategyVerifyParams } from 'remix-auth-twitter'

import { NodeType, OAuthAddressType } from '@proofzero/types/address'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'

import {
  createAuthenticatorSessionStorage,
  getTwitterStrategy,
} from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { redirectToCustomDomainHost } from '~/utils/connect-proxy'

import { Authenticator } from 'remix-auth'
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
    const addressClient = getAddressClient(
      address,
      context.env,
      context.traceSpan
    )
    const { accountURN, existing } = await addressClient.resolveAccount.query({
      jwt: await getUserSession(request, context.env, appData?.clientId),
      force: !appData || appData.rollup_action !== 'connect',
    })

    await addressClient.setOAuthData.mutate({
      accessToken,
      accessTokenSecret,
      profile: { ...profile, provider: OAuthAddressType.Twitter },
    })

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
