import { ActionFunction, json } from '@remix-run/cloudflare'

import CFImageUploadClient from '@kubelt/platform-clients/cf-image-upload'

import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)

  const imageClient = new CFImageUploadClient(Images)
  const imageUploadUrl = await imageClient.getImageUploadUrl()
  return json(imageUploadUrl)
}
