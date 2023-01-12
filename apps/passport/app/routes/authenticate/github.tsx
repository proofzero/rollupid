import { ActionArgs, ActionFunction, LoaderArgs, LoaderFunction, redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect("/authenticate");
}

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  console.debug("GITHUB action:", request)
  const blah = await authenticator.authenticate(GitHubStrategyDefaultName, request)
  console.debug("GITHUB action after", blah)
  return blah
}
