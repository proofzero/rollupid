import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { Twitter2StrategyDefaultName } from 'remix-auth-twitter'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { getTwitterStrategy, injectAuthnParamsIntoSession } from '~/auth.server'
import {
  redirectToDefaultHost,
  setCustomDomainOrigin,
} from '~/utils/connect-proxy'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const authnParams = new URL(request.url).searchParams
    setCustomDomainOrigin(request, context, authnParams)

    const authenticatorInputs = await injectAuthnParamsIntoSession(
      authnParams.toString(),
      request,
      context.env
    )

    const strategy = getTwitterStrategy(context.env)
    if (authnParams.get('state'))
      // @ts-ignore
      strategy.generateState = () => authnParams.get('state')

    const authenticator = new Authenticator(authenticatorInputs.sessionStorage)
    authenticator.use(strategy)

    try {
      const response = await authenticator.authenticate(
        Twitter2StrategyDefaultName,
        authenticatorInputs.newRequest
      )
      return response
    } catch (error) {
      if (!(error instanceof Response)) throw error
      const response = error
      redirectToDefaultHost(request, response, context)
    }
  }
)
