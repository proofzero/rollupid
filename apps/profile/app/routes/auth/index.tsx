import { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupAuthenticator } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const authenticator = getRollupAuthenticator()
  await authenticator.isAuthenticated(request, {
    successRedirect: '/account',
    // failureRedirect: 'https://threeid.xyz/profiles',
  })

  return authenticator.authenticate('rollup', request)
}
