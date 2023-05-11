import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'

import { GitHubStrategyDefaultName } from 'remix-auth-github'
import {
  getGithubAuthenticator,
  injectAuthnParamsIntoSession,
} from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authnParams = new URL(request.url).searchParams.toString()
  const authenticatorInputs = await injectAuthnParamsIntoSession(
    authnParams,
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
