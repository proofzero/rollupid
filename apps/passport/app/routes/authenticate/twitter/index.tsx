import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { initAuthenticator, getTwitterStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getTwitterStrategy(context.env))
  return authenticator.authenticate(TwitterStrategyDefaultName, request)
}
