import { ActionFunction, json, redirect } from '@remix-run/cloudflare'

import CFImageUploadClient from '@kubelt/platform-clients/cf-image-upload'

export const loader = async () => {
  return redirect('/account/settings/profile')
}

export const action: ActionFunction = async () => {
  const imageClient = new CFImageUploadClient(Images)
  const imageUploadUrl = await imageClient.getImageUploadUrl()
  return json(imageUploadUrl)
}
