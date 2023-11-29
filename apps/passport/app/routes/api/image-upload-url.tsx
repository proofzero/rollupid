import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createImageClient from '@proofzero/platform-clients/image'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getValidatedSessionContext } from '~/session.server'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )
    const imageClient = createImageClient(context.env.Images, {
      headers: generateTraceContextHeaders(context.traceSpan),
    })
    const { uploadURL } = (await imageClient.upload.mutate()) as {
      uploadURL: string
    }
    return json(uploadURL)
  }
)
