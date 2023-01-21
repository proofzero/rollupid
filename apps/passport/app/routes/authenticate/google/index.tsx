import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import {
  authenticator,
  getGoogleAuthenticator,
  parseParams,
} from '~/auth.server'

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

  const callbackURL = `${INTERNAL_GOOGLE_OAUTH_CALLBACK_URL}?rollup=${callbackEncoding}`

  authenticator.use(getGoogleAuthenticator(callbackURL))

  return authenticator.authenticate(GoogleStrategyDefaultName, request)
}
