import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/utilities/platform.server'
import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name') as string

  if (!clientName) throw 'App name is required'

  const jwt = await requireJWT(request)

  const starbaseClient = getStarbaseClient(jwt)
  const app = await starbaseClient.kb_appCreate(clientName)
  console.log({ app })
}
