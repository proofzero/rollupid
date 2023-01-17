import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientId = formData.get('clientId')?.toString()

  if (!clientId) throw 'Client ID is required'

  const jwt = await requireJWT(request)

  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
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
