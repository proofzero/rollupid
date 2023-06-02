import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GoogleStrategyDefaultName } from 'remix-auth-google'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import {
  getGoogleAuthenticator,
  injectAuthnParamsIntoSession,
} from '~/auth.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
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
)
