import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import { initAuthenticator, getGoogleAuthenticator } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getGoogleAuthenticator(context.env))

  return authenticator.authenticate(GoogleStrategyDefaultName, request)
}
