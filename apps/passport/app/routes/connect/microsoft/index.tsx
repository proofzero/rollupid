import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import {
  getMicrosoftStrategy,
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
    //For the falsy assignment, value needs to be a non-character string, as falsy values
    //lead to the authenticator forcing a prompt value of 'none', which breaks login
    //when user's not already signed into their MS account
    const prompt =
      rollup_action && rollup_action === 'reconnect' ? 'consent' : ' '

    const authenticator = new Authenticator(authenticatorInputs.sessionStorage)
    authenticator.use(getMicrosoftStrategy(context.env, prompt))
    return authenticator.authenticate(
      MicrosoftStrategyDefaultName,
      authenticatorInputs.newRequest
    )
  }
)
