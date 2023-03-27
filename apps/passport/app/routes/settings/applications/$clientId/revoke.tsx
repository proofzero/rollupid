import type { ActionFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'

import { getAccessClient } from '~/platform.server'

import { getFlashSession, commitFlashSession } from '~/session.server'
import { BadRequestError } from '@proofzero/errors'

export const action: ActionFunction = async ({ request, params, context }) => {
  const session = await getFlashSession(request, context.env)

  const { jwt } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

  const { clientId } = params

  if (!clientId) {
    throw new BadRequestError({ message: 'Client ID is required for query' })
  }

  try {
    const accessClient = getAccessClient(context.env, context.traceSpan, jwt)

    await accessClient.revokeAppAuthorization.mutate({ clientId })

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

  return redirect('/settings/applications', {
    headers: {
      'Set-Cookie': await commitFlashSession(context.env, session),
    },
  })
}
