import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GitHubStrategyDefaultName } from 'remix-auth-github'
import {
  initAuthenticator,
  getGithubAuthenticator,
  parseParams,
} from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const { clientId, redirectUri, scope, state } = await parseParams(
    request,
    true
  )

  const callbackEncoding = encodeURIComponent(
    JSON.stringify({
      clientId,
      redirectUri,
      scope,
      state,
    })
  )

  const authenticator = initAuthenticator(context.env)
  authenticator.use(getGithubAuthenticator(context.env))

  return authenticator.authenticate(GitHubStrategyDefaultName, request)
}
