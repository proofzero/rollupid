import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GoogleStrategyDefaultName } from 'remix-auth-google'

import {
  getGoogleAuthenticator,
  injectAuthnParamsIntoSession,
} from '~/auth.server'
import { Authenticator } from 'remix-auth'

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
  const rollup_action = authnParams.get('rollup_action')
  const prompt =
    rollup_action && rollup_action === 'reconnect' ? 'consent' : undefined

  const authenticator = new Authenticator(authenticatorInputs.sessionStorage)
  authenticator.use(getGoogleAuthenticator(context.env, prompt))
  return authenticator.authenticate(
    GoogleStrategyDefaultName,
    authenticatorInputs.newRequest
  )
}
