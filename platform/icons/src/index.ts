/**
 * @file cfw/icons/src/index.ts
 *
 * This service provides user "direct upload" links that allow the
 * recipient to upload an image for a limited period of time without
 * needing an authentication token, etc.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { add as dateAdd, formatRFC3339 as dateFormat } from 'date-fns'

import invariant from 'tiny-invariant'
import checkEnv from '@kubelt/platform.commons/src/utils/checkEnv'

import { required as requiredEnv } from './env'

// Environment
// -----------------------------------------------------------------------------
// These values are supplied via the wrangler.toml configuration file.

export interface Env {
  // Secrets
  // ---------------------------------------------------------------------------

  // The Cloudflare account identifier that uploaded images will be
  // associated with.
  INTERNAL_CLOUDFLARE_ACCOUNT_ID: string

  // An API token with write permissions for the Images service.
  TOKEN_CLOUDFLARE_API: string

  // Environment variables
  // ---------------------------------------------------------------------------

  // Duration in seconds of the upload window, i.e. how long the
  // returned image upload URL can be used to upload an image.
  UPLOAD_WINDOW_SECONDS: number
}

// Service
// -----------------------------------------------------------------------------

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    checkEnv(requiredEnv, env as unknown as Record<string, unknown>)

    const { headers } = request
    const contentType = headers.get('content-type') || ''

    // If user supplies a JSON object in POST body, use that as the image metadata.
    let body = {}
    if (contentType.includes('application/json')) {
      body = await request.json()
    }

    // Arbitrary key/value pairs associated with the image. Can be used
    // for keeping references to another system of record.
    const metadata = JSON.stringify(body)

    // The date after which the upload will not be accepted.
    // - minimum: now + 2 minutes
    // - maximum: now + 6 hours
    // NB: Date.now() is the number of milliseconds since the epoch.
    const expiryDate = dateAdd(Date.now(), {
      seconds: env.UPLOAD_WINDOW_SECONDS,
    })
    // The API expects the expiry time to be an RFC3339-format value.
    const expiry = dateFormat(expiryDate)

    // Configuration for the direct_upload Cloudflare API call:
    const formData = new FormData()
    // Is a signature token required to access the uploaded image?
    formData.append('requireSignedURLs', false)
    formData.append('metadata', metadata)
    formData.append('expiry', expiry)

    // URL for "Create authenticated direct upload URL V2" endpoint.
    const url = `https://api.cloudflare.com/client/v4/accounts/${env.TOKEN_CLOUDFLARE_API}/images/v2/direct_upload`

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
        Authorization: `Bearer ${env.TOKEN_CLOUDFLARE_API}`,
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
    const direct_upload = await response.json()

    if (!direct_upload.success) {
      return new Response(JSON.stringify(direct_upload), {
        status: 500,
      })
    }

    const result = JSON.stringify(direct_upload.result)

    return new Response(result, {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  },
}
