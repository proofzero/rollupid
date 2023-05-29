import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@proofzero/platform-clients/image'
import { requireJWT } from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await requireJWT(request)
    const imageClient = createImageClient(Images, {
      headers: generateTraceContextHeaders(context.traceSpan),
    })
    try {
      const { uploadURL } = await imageClient.upload.mutate()
      return json(uploadURL)
    } catch (ex) {
      console.error(ex)
      return null
    }
  }
)
