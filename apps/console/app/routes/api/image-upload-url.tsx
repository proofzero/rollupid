import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'

export const action: ActionFunction = async ({ request }) => {
  const imageClient = createImageClient(Images)

  const { uploadURL } = await imageClient.upload.mutate()
  return json(uploadURL)
}
