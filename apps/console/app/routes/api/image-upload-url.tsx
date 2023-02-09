import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'
import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)
  const imageClient = createImageClient(Images)
  try {
    const { uploadURL } = await imageClient.getOneTimeImageUploadURL.query({})
    return json(uploadURL)
  } catch (ex) {
    console.error(ex)
    return null
  }
}
