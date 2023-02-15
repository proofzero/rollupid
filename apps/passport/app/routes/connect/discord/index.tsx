import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { DiscordStrategyDefaultName } from 'remix-auth-discord'
import { initAuthenticator, getDiscordStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getDiscordStrategy(context.env))
  return authenticator.authenticate(DiscordStrategyDefaultName, request)
}
