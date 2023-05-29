import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'

import {
  getMicrosoftStrategy,
  injectAuthnParamsIntoSession,
} from '~/auth.server'
import { Authenticator } from 'remix-auth'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }: ActionArgs) => {
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
