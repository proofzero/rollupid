import type { LoaderFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GitHubStrategyDefaultName } from 'remix-auth-github'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import {
  getGithubAuthenticator,
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
    const authenticator = new Authenticator(authenticatorInputs.sessionStorage)
    authenticator.use(getGithubAuthenticator(context.env))

    return authenticator.authenticate(
      GitHubStrategyDefaultName,
      authenticatorInputs.newRequest
    )
  }
)
