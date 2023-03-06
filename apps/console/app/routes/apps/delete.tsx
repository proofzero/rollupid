import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const clientId = formData.get('clientId')?.toString()

  if (!clientId) throw 'Client ID is required'

  const jwt = await requireJWT(request)

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })
  try {
    await starbaseClient.deleteApp.mutate({
      clientId,
    })
    return redirect(`/`)
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}
