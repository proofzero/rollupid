import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'

import {
  createAuthenticatorSessionStorage,
  getAppleStrategy,
  injectAuthnParamsIntoSession,
} from '~/auth.server'
import { AppleStrategyDefaultName } from '~/utils/applestrategy.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: ActionArgs) => {
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
