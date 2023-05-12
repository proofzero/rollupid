import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { getTwitterStrategy, injectAuthnParamsIntoSession } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
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
