import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/utilities/platform.server'
import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientId = formData.get('clientId')

  if (!clientId) throw 'Client ID is required'

  const jwt = await requireJWT(request)

  const starbaseClient = getStarbaseClient(jwt)
  try {
    await starbaseClient.kb_appDelete({
      clientId,
    })
    return redirect(`/`)
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}
