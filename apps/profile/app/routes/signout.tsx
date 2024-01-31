import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { initAuthenticator } from '~/utils/session.server'

const signOut = (request: Request, env: Env) => {
  const authenticator = initAuthenticator(env)
  return authenticator.logout(request, {
    redirectTo: `/auth`,
  })
}

export const loader: LoaderFunction = async ({ request, context }) => {
  return signOut(request, context.env)
}

export const action: ActionFunction = async ({ request, context }) => {
  return signOut(request, context.env)
}
