import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { decodeJwt } from 'jose'

import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import type { OAuthAppleProfile } from '@kubelt/platform.address/src/types'

import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'

import { AppleStrategyDefaultName } from '~/utils/applestrategy.server'
import type { AppleExtraParams } from '~/utils/applestrategy.server'

import { initAuthenticator, getAppleStrategy } from '~/auth.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'

type AppleUser = {
  email: string
  name: {
    firstName: string
    lastName: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData()
  const searchParams = new URLSearchParams()
  data.forEach((value, key) => {
    if (typeof value == 'string') {
      searchParams.set(key, value)
    }
  })

  return redirect(`${request.url}?${searchParams}`)
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found')
      return null
    })

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getAppleStrategy(context.env))

  const { accessToken, refreshToken, extraParams } =
    (await authenticator.authenticate(AppleStrategyDefaultName, request)) as {
      accessToken: string
      refreshToken: string
      extraParams: AppleExtraParams
    }

  const token = decodeJwt(extraParams.id_token)
  if (!token?.sub) {
    throw new Error('id token missing sub')
  }

  const user = getUser(request)

  const profile: OAuthAppleProfile = {
    provider: OAuthAddressType.Apple,
    email: token.email as string,
    name: user?.name,
    sub: token.sub,
    picture: '',
    isApple: true,
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
    jwt: await getJWTConditionallyFromSession(request, context.env),
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
    context.env,
    context.traceSpan
  )
}

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
