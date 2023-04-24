import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { DiscordStrategyDefaultName } from 'remix-auth-discord'
import { initAuthenticator, getDiscordStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt') || 'none'
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getDiscordStrategy(prompt, context.env))
  return authenticator.authenticate(DiscordStrategyDefaultName, request)
}
