import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { decodeJwt } from 'jose'

import { NodeType, OAuthAddressType } from '@proofzero/types/address'
import type { AppleOAuthProfile } from '@proofzero/platform.address/src/types'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'

import { AppleStrategyDefaultName } from '~/utils/applestrategy.server'
import type { AppleExtraParams } from '~/utils/applestrategy.server'

import {
  createAuthenticatorSessionStorage,
  getAppleStrategy,
} from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import {
  authenticateAddress,
  checkOAuthError,
} from '~/utils/authenticate.server'
import { redirectToCustomDomainHost } from '~/utils/connect-proxy'

import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { Authenticator } from 'remix-auth'
import { InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

type AppleUser = {
  email: string
  name: {
    firstName: string
    lastName: string
  }
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request }) => {
    const data = await request.formData()
    const searchParams = new URLSearchParams()
    data.forEach((value, key) => {
      if (typeof value == 'string') {
        searchParams.set(key, value)
      }
    })

    return redirect(`${request.url}?${searchParams}`)
  }
)

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
    authenticator.use(getAppleStrategy(context.env))

    const { accessToken, refreshToken, extraParams } =
      (await authenticator.authenticate(AppleStrategyDefaultName, request)) as {
        accessToken: string
        refreshToken: string
        extraParams: AppleExtraParams
      }

    const token = decodeJwt(extraParams.id_token)
    if (!token?.sub) {
      throw new InternalServerError({
        message: 'Callback ID token missing sub',
      })
    }

    const user = getUser(request)

    const profile: AppleOAuthProfile & { provider: string; sub: string } = {
      provider: OAuthAddressType.Apple,
      email: token.email as string,
      name: user?.name
        ? `${user.name.firstName} ${user.name.lastName}`
        : (token.email as string),
      sub: token.sub,
      picture: '',
    }

    const address = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(OAuthAddressType.Apple, token.sub),
      { node_type: NodeType.OAuth, addr_type: OAuthAddressType.Apple },
      { alias: profile.email, hidden: 'true' }
    )
    const addressClient = getAddressClient(
      address,
      context.env,
      context.traceSpan
    )
    const account = await addressClient.resolveAccount.query({
      jwt: await getUserSession(request, context.env, appData?.clientId),
      force: !appData || appData.rollup_action !== 'connect',
    })
    const current = await addressClient.getOAuthData.query()

    if (current) {
      await addressClient.setOAuthData.mutate({
        ...current,
        accessToken,
        refreshToken,
        extraParams,
      })
    } else {
      await addressClient.setOAuthData.mutate({
        accessToken,
        refreshToken,
        extraParams,
        profile,
      })
    }

    return authenticateAddress(
      address,
      account.accountURN,
      appData,
      request,
      context.env,
      context.traceSpan
    )
  }
)

const getUser = (request: Request): AppleUser | undefined => {
  const url = new URL(request.url)
  const userParam = url.searchParams.get('user')
  if (userParam) {
    try {
      return JSON.parse(userParam)
    } catch (err) {
      console.error(err)
    }
  }
}

export default () => {}
