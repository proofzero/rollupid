import { GrantType } from '@kubelt/platform.access/src/types'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import {
  createProfileSession,
  getAuthorizeStateSession,
} from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams

  const code = params.get('code')
  if (!code) {
    throw json(
      {
        error: 'No code provided',
      },
      {
        status: 400,
      }
    )
  }

  const state = params.get('state')
  if (!state) {
    throw json(
      {
        error: 'No state provided',
      },
      {
        status: 400,
      }
    )
  }

  const stateSession = await getAuthorizeStateSession(request)
  const storedState = stateSession.get('state')

  console.log({ state, storedState })

  if (state !== storedState) {
    throw json(
      { error: 'Invalid state' },
      {
        status: 400,
      }
    )
  }

  const galaxyClient = await getGalaxyClient()
  const token = await galaxyClient
    .exchangeToken({
      exchange: {
        grantType: GrantType.AuthorizationCode,
        code,
        redirectUri: REDIRECT_URI,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
    })
    .then((res) => res.exchangeAuthorizationToken)

  if (!token) {
    throw json(
      { error: 'No token exchanged' },
      {
        status: 400,
      }
    )
  }

  return createProfileSession(token.accessToken, '/account')
}
