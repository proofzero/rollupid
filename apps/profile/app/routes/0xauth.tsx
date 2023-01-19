import { GrantType } from '@kubelt/platform.access/src/types'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams

  if (!params.get('code')) {
    throw json(
      {
        error: 'No code provided',
      },
      {
        status: 400,
      }
    )
  }

  if (!params.get('state')) {
    throw json(
      {
        error: 'No state provided',
      },
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
        code: params.get('code'),
        redirectUri: REDIRECT_URI,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
    })
    .then((res) => res.exchangeToken)

  // TODO: complete the excchange and store the token and create session
}
