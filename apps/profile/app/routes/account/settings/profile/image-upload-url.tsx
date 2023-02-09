import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utils/session.server'

import createImageClient from '@kubelt/platform-clients/image'

export const loader: LoaderFunction = async ({ request }) => {
  await requireJWT(request)
  return redirect('/account/settings/profile')
}

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)

  const imageClient = createImageClient(Images)
  const { uploadURL } = await imageClient.getOneTimeImageUploadURL.query({})
  console.log({ uploadURL })
  return json(uploadURL)
}
