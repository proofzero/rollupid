import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { initAuthenticator, getAppleStrategy } from '~/auth.server'
import { AppleStrategyDefaultName } from '~/utils/applestrategy.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getAppleStrategy(context.env))
  return authenticator.authenticate(AppleStrategyDefaultName, request)
}
