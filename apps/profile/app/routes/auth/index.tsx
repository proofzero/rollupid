import type { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupAuthenticator } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = getRollupAuthenticator(context.env)
  await authenticator.isAuthenticated(request, {
    successRedirect: '/account',
    // failureRedirect: 'https://rollup.id/profiles',
  })

  return authenticator.authenticate('rollup', request)
}
