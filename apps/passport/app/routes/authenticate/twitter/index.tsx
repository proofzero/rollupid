import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { authenticator, getTwitterStrategy, parseParams } from '~/auth.server'

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const { clientId, redirectUri, scope, state } = await parseParams(
    request,
    true
  )

  const callbackEncoding = encodeURIComponent(
    JSON.stringify({
      clientId,
      redirectUri,
      scope,
      state,
    })
  )

  const callbackURL = `${INTERNAL_TWITTER_OAUTH_CALLBACK_URL}?rollup=${callbackEncoding}`
  authenticator.use(getTwitterStrategy(callbackURL))
  return authenticator.authenticate(TwitterStrategyDefaultName, request)
}
