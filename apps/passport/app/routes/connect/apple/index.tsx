import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { getAppleStrategy, injectAuthnParamsIntoSession } from '~/auth.server'
import { AppleStrategyDefaultName } from '~/utils/applestrategy.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const authnParams = new URL(request.url).searchParams
    const authenticatorInputs = await injectAuthnParamsIntoSession(
      authnParams.toString(),
      request,
      context.env
    )
    const authenticator = new Authenticator(authenticatorInputs.sessionStorage)

    authenticator.use(getAppleStrategy(context.env))
    return authenticator.authenticate(
      AppleStrategyDefaultName,
      authenticatorInputs.newRequest
    )
  }
)
