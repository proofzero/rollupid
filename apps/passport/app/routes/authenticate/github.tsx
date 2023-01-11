import { ActionArgs, ActionFunction, LoaderArgs, LoaderFunction, redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { GitHubStrategyDefaultName } from 'remix-auth-github'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect("/authenticate");
}

export const action: ActionFunction = ({ request }: ActionArgs) => {
  return authenticator.authenticate(GitHubStrategyDefaultName, request)
}
