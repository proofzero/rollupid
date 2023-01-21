import { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { create0xAuthSession, parseParams } from '~/auth.server'

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const { clientId, redirectUri, scope, state } = await parseParams(
    request,
    true
  )

  return create0xAuthSession(
    'github',
    clientId as string,
    state as string,
    redirectUri as string,
    scope as string,
    '/authenticate/github/strategy'
  )
}
