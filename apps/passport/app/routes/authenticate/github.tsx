import {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
  redirect,
} from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { GitHubStrategy, GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator } from '~/auth.server'

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const searchParams = new URL(request.url).searchParams
  console.log(`${INTERNAL_GITHUB_OAUTH_CALLBACK_URL}?${searchParams}`)
  authenticator.use(
    new GitHubStrategy(
      {
        clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
        clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
        callbackURL: `${INTERNAL_GITHUB_OAUTH_CALLBACK_URL}?${searchParams}`,
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
