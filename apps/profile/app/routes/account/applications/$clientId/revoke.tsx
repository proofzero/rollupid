import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'

import {
  commitProfileSession,
  getProfileSession,
  requireJWT,
} from '~/utils/session.server'

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getProfileSession(request)

  const jwt = await requireJWT(request)
  const { clientId } = params

  if (!clientId) {
    throw new Error('Client ID is required for query')
  }

  try {
    const currentClientId = PROFILE_CLIENT_ID
    if (clientId === currentClientId) {
      throw new Error('Unable to revoke current app')
    }

    const galaxyClient = await getGalaxyClient()
    await galaxyClient.revokeAppAuthorization(
      {
        clientId,
      },
      getAuthzHeaderConditionallyFromToken(jwt)
    )

    session.flash(
      'tooltipMessage',
      JSON.stringify({
        type: 'success',
        message: 'Access Removed',
      })
    )
  } catch (ex) {
    console.error(ex)

    session.flash(
      'tooltipMessage',
      JSON.stringify({
        type: 'error',
        message: 'Error Removing Access',
      })
    )
  }

  return redirect('/account/applications', {
    headers: {
      'Set-Cookie': await commitProfileSession(session),
    },
  })
}
