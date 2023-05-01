import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { GoogleStrategyDefaultName } from 'remix-auth-google'
import { initAuthenticator, getGoogleAuthenticator } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt') || 'select_account'
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getGoogleAuthenticator(prompt, context.env))
  return authenticator.authenticate(GoogleStrategyDefaultName, request)
}
