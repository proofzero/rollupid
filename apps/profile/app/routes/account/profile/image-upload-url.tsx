import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utils/session.server'

import createImageClient from '@kubelt/platform-clients/image'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

export const loader: LoaderFunction = async ({ request }) => {
  await requireJWT(request)
  return redirect('/account/profile')
}

export const action: ActionFunction = async ({ request, context }) => {
  await requireJWT(request)

  const imageClient = createImageClient(Images, {
    headers: generateTraceContextHeaders(context.traceSpan),
  })
  const { uploadURL } = await imageClient.upload.mutate()
  return json(uploadURL)
}
