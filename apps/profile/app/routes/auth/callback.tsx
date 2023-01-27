import { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupAuthenticator } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const authenticator = getRollupAuthenticator()
  await authenticator.authenticate('rollup', request, {
    successRedirect: '/account',
  })
}
