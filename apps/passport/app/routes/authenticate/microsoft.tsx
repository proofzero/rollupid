import { ActionArgs, ActionFunction, redirect } from '@remix-run/cloudflare'
import {
  MicrosoftStrategy,
  MicrosoftStrategyDefaultName,
} from 'remix-auth-microsoft'
import { authenticator } from '~/auth.server'

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const searchParams = new URL(request.url).searchParams
  console.log(`${INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL}?${searchParams}`)
  authenticator.use(
    new MicrosoftStrategy(
      {
        clientId: INTERNAL_MICROSOFT_OAUTH_CLIENT_ID,
        tenantId: INTERNAL_MICROSOFT_OAUTH_TENANT_ID,
        clientSecret: SECRET_MICROSOFT_OAUTH_CLIENT_SECRET,
        redirectUri: `${INTERNAL_MICROSOFT_OAUTH_CALLBACK_URL}?${searchParams}`,
        scope: 'openid profile User.Read offline_access',
        prompt: '',
      },
      async ({ ...args }) => {
        return { ...args }
      }
    )
  )
  const result = await authenticator.authenticate(
    MicrosoftStrategyDefaultName,
    request
  )
  return result
}
