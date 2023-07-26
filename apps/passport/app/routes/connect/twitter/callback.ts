import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { Twitter2StrategyDefaultName } from 'remix-auth-twitter'
import type { Twitter2StrategyVerifyParams } from 'remix-auth-twitter'

import { NodeType, OAuthAddressType } from '@proofzero/types/address'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'

import {
  createAuthenticatorSessionStorage,
  getTwitterStrategy,
} from '~/auth.server'
import { getCoreClient } from '~/platform.server'
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

    const { accessToken } = (await authenticator.authenticate(
      Twitter2StrategyDefaultName,
      request
    )) as Twitter2StrategyVerifyParams

    const meURL = new URL('https://api.twitter.com/2/users/me')
    meURL.searchParams.set('user.fields', 'id,name,profile_image_url,username')
    const userResponse = await fetch(meURL.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const { data } = await userResponse.json<{ data: any }>()
    const profile = {
      id: data.id,
      name: data.name,
      username: data.username,
      picture: data.profile_image_url,
    }

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.Twitter, profile.id),
      { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Twitter },
      { alias: profile.username, hidden: 'true' }
    )
    const coreClient = getCoreClient({ context, addressURN })
    const { accountURN, existing } =
      await coreClient.address.resolveAccount.query({
        jwt: await getUserSession(request, context.env, appData?.clientId),
        force: !appData || appData.rollup_action !== 'connect',
      })

    await coreClient.address.setOAuthData.mutate({
      accessToken,
      profile: { ...profile, provider: OAuthAddressType.Twitter },
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
