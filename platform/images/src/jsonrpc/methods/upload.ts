import { z } from 'zod'
import { Context } from '../../context'
import { add as dateAdd, formatRFC3339 as dateFormat } from 'date-fns'

export const uploadMethodOutput = z
  .custom<Response>((val) => typeof val === typeof Response)
  .or(
    z.object({
      id: z.string(),
      uploadURL: z.string().url(),
    })
  )

export type uploadMethodOutputParams = z.infer<typeof uploadMethodOutput>

export const uploadMethod = async ({
  ctx,
}: {
  ctx: Context
}): Promise<uploadMethodOutputParams> => {
  console.log('New request on /upload')

  const headers = ctx.req?.headers
  const contentType = (headers as Headers).get('content-type') || ''
  // If user supplies a JSON object in POST body, use that as the image metadata.
  let body: any = {}
  if (contentType.includes('application/json')) {
    body = await ctx.req?.body
    console.dir({ body })
  }
  // Arbitrary key/value pairs associated with the image. Can be used
  // for keeping references to another system of record.
  const metadata = JSON.stringify(body)

  // The date after which the upload will not be accepted.
  // - minimum: now + 2 minutes
  // - maximum: now + 6 hours
  // NB: Date.now() is the number of milliseconds since the epoch.
  const expiryDate = dateAdd(Date.now(), {
    seconds: ctx.UPLOAD_WINDOW_SECONDS,
  })
  // The API expects the expiry time to be an RFC3339-format value.
  const expiry = dateFormat(expiryDate)
  // Configuration for the direct_upload Cloudflare API call:
  const formData = new FormData()
  // Is a signature token required to access the uploaded image?
  formData.append('requireSignedURLs', 'false')
  formData.append('metadata', metadata)
  formData.append('expiry', expiry)
  // URL for "Create authenticated direct upload URL V2" endpoint.
  const url = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`
  // Direct uploads allow users to upload images without API keys. A
  // common use case are web apps, client-side applications, or mobile
  // devices where users upload content directly to Cloudflare
  // Images. This method creates a draft record for a future image. It
  // returns an upload URL and an image identifier. To verify if the
  // image itself has been uploaded, send an image details request
  // (accounts/:account_identifier/images/v1/:identifier), and check that
  // the draft: true property is not present.

  const uploadRequest = new Request(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.TOKEN_CLOUDFLARE_API}`,
    },
    // NB: do *not* explicitly set the Content-Type header to
    // "multipart/form-data"; this prevents the header from being set
    // with the correct boundary expression used to delimit form
    // fields in the request body.
    body: formData,
  })
  const response = await fetch(uploadRequest)
  // Check the HTTP status.
  if (!response.ok) {
    return response
  }

  // Example response body:
  // {
  //   "success": true,
  //   "errors": [],
  //   "messages": [],
  //   "result": {
  //     "uploadURL": "https://upload.imagedelivery.net/<acct-id>/<image-id>",
  //     "id": "<image-id>"
  //   }
  // }
  const direct_upload = await response.json<{
    success: boolean
    result: object
  }>()
  if (!direct_upload.success) {
    return new Response(JSON.stringify(direct_upload), {
      status: 500,
    })
  }
  const result: { id: string; uploadURL: string } = direct_upload.result as {
    uploadURL: string
    id: string
  }

  console.log(result)

  return result
}
