import { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { GitHubStrategy, GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator } from '~/auth.server'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  authenticator.use(
    new GitHubStrategy(
      {
        clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
        clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
        callbackURL: INTERNAL_GITHUB_OAUTH_CALLBACK_URL,
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
