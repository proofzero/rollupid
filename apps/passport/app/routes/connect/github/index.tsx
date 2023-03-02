import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { initAuthenticator, getGithubAuthenticator } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  await new Promise((ok) => setTimeout(ok, 50000))
  // const authenticator = initAuthenticator(context.env)
  // authenticator.use(getGithubAuthenticator(context.env))

  // return authenticator.authenticate(GitHubStrategyDefaultName, request)
}
