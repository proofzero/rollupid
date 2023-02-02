import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'
import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)
  const imageClient = createImageClient(Images)

  const { uploadURL } = await imageClient.upload.mutate()
  return json(uploadURL)
}
