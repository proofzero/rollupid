import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import {
  createAuthorizeStateSession,
  getUserSession,
} from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  // check if the user is already logged in
  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  if (jwt) {
    return redirect('/account')
  }
  const state = [...crypto.getRandomValues(new Uint8Array(8))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const authParams = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
  })

  console.log({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
  })

  const redirectURL = `${PASSPORT_URL}/authorize?${authParams}`

  // set the state in a cookie
  return createAuthorizeStateSession(state, redirectURL)
}
