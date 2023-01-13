import { redirect } from '@remix-run/cloudflare'
import type { ActionArgs, ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { authenticator } from '~/auth.server'

export const loader: LoaderFunction = () => {
  return redirect('/authenticate')
}

export const action: ActionFunction = ({ request }: ActionArgs) => {
  return authenticator.authenticate(TwitterStrategyDefaultName, request)
}
