import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/utilities/platform.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name')

  if (!clientName) throw 'App name is required'

  const starbaseClient = getStarbaseClient()
  const app = await starbaseClient.createApplication(clientName as string)
  console.log({ app })
}
