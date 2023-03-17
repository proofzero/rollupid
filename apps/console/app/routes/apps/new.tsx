import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name') as string

  if (!clientName) throw 'App name is required'

  const jwt = await requireJWT(request)

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })
  try {
    const { clientId } = await starbaseClient.createApp.mutate({ clientName })
    console.log({ clientId })
    return redirect(`/apps/${clientId}`)
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}
