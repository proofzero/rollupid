import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GitHubStrategyDefaultName } from 'remix-auth-github'
import {
  authenticator,
  getGithubAuthenticator,
  parseParams,
} from '~/auth.server'

export const action: ActionFunction = async ({ request }: ActionArgs) => {
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

  const callbackURL = `${INTERNAL_GITHUB_OAUTH_CALLBACK_URL}?rollup=${callbackEncoding}`

  authenticator.use(getGithubAuthenticator(callbackURL))

  return authenticator.authenticate(GitHubStrategyDefaultName, request)
}
