import { ActionArgs, ActionFunction, LoaderArgs, LoaderFunction, redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect("/authenticate");
}

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const result = await authenticator.authenticate(GitHubStrategyDefaultName, request)
  return result
}
