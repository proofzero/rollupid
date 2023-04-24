import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { initAuthenticator, getMicrosoftStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt') || 'none'
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getMicrosoftStrategy(prompt, context.env))
  return authenticator.authenticate(MicrosoftStrategyDefaultName, request)
}
