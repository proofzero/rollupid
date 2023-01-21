import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticator, getMicrosoftStrategy, parseParams } from '~/auth.server'

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

  const callbackURL = `${INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL}?rollup=${callbackEncoding}`

  authenticator.use(getMicrosoftStrategy(callbackURL))
  return authenticator.authenticate(MicrosoftStrategyDefaultName, request)
}
