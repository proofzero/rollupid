import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GitHubStrategy, GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator, parseParams } from '~/auth.server'

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

  authenticator.use(
    new GitHubStrategy(
      {
        clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
        clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
        callbackURL: callbackURL,
        allowSignup: false,
        scope: [],
      },
      async ({ ...args }) => {
        //Return all fields
        return { ...args }
      }
    )
  )

  const result = await authenticator.authenticate(
    GitHubStrategyDefaultName,
    request
  )
  return result
}
