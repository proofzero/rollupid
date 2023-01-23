import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { initAuthenticator, getMicrosoftStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getMicrosoftStrategy(context.env))
  return authenticator.authenticate(MicrosoftStrategyDefaultName, request)
}
