import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { getTwitterStrategy, injectAuthnParamsIntoSession } from '~/auth.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const authnParams = new URL(request.url).searchParams
    const authenticatorInputs = await injectAuthnParamsIntoSession(
      authnParams.toString(),
      request,
      context.env
    )

    const authenticator = new Authenticator(authenticatorInputs.sessionStorage)
    authenticator.use(getTwitterStrategy(context.env))
    return authenticator.authenticate(
      TwitterStrategyDefaultName,
      authenticatorInputs.newRequest
    )
  }
)
