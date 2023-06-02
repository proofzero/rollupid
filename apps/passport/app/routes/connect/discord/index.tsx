import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { DiscordStrategyDefaultName } from 'remix-auth-discord'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { getDiscordStrategy, injectAuthnParamsIntoSession } from '~/auth.server'

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
    authenticator.use(getDiscordStrategy(context.env, prompt))
    return authenticator.authenticate(
      DiscordStrategyDefaultName,
      authenticatorInputs.newRequest
    )
  }
)
