import { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupAuthenticator } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const authenticator = getRollupAuthenticator()
  const user = await authenticator.authenticate('rollup', request)

  // TODO: set a refresh timer within a special profile DO

  return null

  // return createProfileSession(token.accessToken, '/account')
}
