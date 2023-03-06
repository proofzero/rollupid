import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@kubelt/platform-clients/image'
import { requireJWT } from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

export const action: ActionFunction = async ({ request, context }) => {
  await requireJWT(request)
  const imageClient = createImageClient(Images, {
    ...generateTraceContextHeaders(context.traceSpan),
  })
  try {
    const { uploadURL } = await imageClient.upload.mutate()
    return json(uploadURL)
  } catch (ex) {
    console.error(ex)
    return null
  }
}
