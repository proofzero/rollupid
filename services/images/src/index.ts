/**
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
import { Router } from 'itty-router'

import invariant from 'tiny-invariant'
import { checkEnv } from '@kubelt/utils'

import { svg2png, initialize } from 'svg2png-wasm'

import { required as requiredEnv } from './env'
import wasm from './assets/svg2png_wasm_bg.wasm'
import colors from './assets/colors.json'
import { keccak256 } from '@ethersproject/keccak256'

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

  // The Cloudflare account identifier that uploaded images public will be used to construct
  HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID: string
}

type CFImageUploadResponse = {
  success: boolean
  errors: []
  result: {
    id: string
    filename: string
    metadata: {
      [key: string]: string
    }
    requiredSignedURLs: boolean
    variants: string[]
    uploaded: string
  }
}

// Service
// -----------------------------------------------------------------------------

const router = Router()

router
  .post(
    '/upload',
    async (request: Request, env: Env, ctx: ExecutionContext) => {
      console.log('New request on /upload')
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
      formData.append('requireSignedURLs', 'false')
      formData.append('metadata', metadata)
      formData.append('expiry', expiry)
      // URL for "Create authenticated direct upload URL V2" endpoint.
      const url = `https://api.cloudflare.com/client/v4/accounts/${env.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`
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
      const direct_upload = await response.json<{
        success: boolean
        result: object
      }>()
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
    }
  )
  .get(
    '/ogimage',
    async (request: Request, env: Env, ctx: ExecutionContext) => {
      // Attempt to download arbitrary images and encode them as data URIs with the
      // image-data-uri library. We cannot use the remote calls offered by
      // image-data-uri because it uses a legacy HTTP library that Cryptopunks 403
      // blocks when called from GCP (for some reason). We need more control so we
      // use the fetch API and pass the bytes retrieved into the library's encoder.
      const encodeDataURI = async (url: string) => {
        return (
          fetch(url)
            // Get the content type and unfortunately await the body. I would prefer
            // that retrieving the body here was thennable, but need the header.
            .then(async (r) => [
              r.headers.get('content-type'),
              await r.arrayBuffer(),
            ])

            // Encode the bytes into a data URI, given their content type.
            .then(([contentType, hexBuffer]) => {
              console.log({ contentType })
              let binary = ''
              let bytes = new Uint8Array(hexBuffer as ArrayBuffer)
              let len = bytes.byteLength
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i])
              }
              return `data:${contentType};base64,${btoa(binary)}`
            })

            // Error logging and status responses.
            .catch((e) => {
              console.log(`failed to encode image ${url} as data URI`)
              console.error(e)
            })
        )
      }

      const query = new URL(request.url).searchParams

      const bgUrl = query.get('bg')
      if (!bgUrl) {
        return new Response('Missing bg query param', {
          status: 400,
        })
      }
      const fgUrl = query.get('fg')
      if (!fgUrl) {
        return new Response('Missing fg query param', {
          status: 400,
        })
      }

      const bg = await encodeDataURI(bgUrl)
      const fg = await encodeDataURI(fgUrl)

      // console.log({ fgUrl, fg })

      // TODO: Load from assets folder?
      // Constants for populating the SVG (optional).
      const OG_WIDTH = 1200
      const OG_HEIGHT = 630
      const svg = `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#Backround)"/>
      <path d="M752.632 246.89C740.674 221.745 726.731 197.594 710.932 174.666L705.837 167.342C699.563 158.24 691.341 150.65 681.768 145.124C672.194 139.597 661.508 136.273 650.489 135.392L641.543 134.671C613.787 132.443 585.899 132.443 558.145 134.671L549.199 135.392C538.179 136.273 527.494 139.597 517.921 145.124C508.347 150.65 500.124 158.24 493.851 167.342L488.755 174.732C472.958 197.66 459.014 221.811 447.056 246.956L443.206 255.05C438.462 265.033 436 275.947 436 287C436 298.053 438.462 308.967 443.206 318.95L447.056 327.044C459.014 352.19 472.958 376.341 488.755 399.268L493.851 406.658C500.124 415.759 508.347 423.35 517.921 428.877C527.494 434.403 538.179 437.728 549.199 438.608L558.145 439.329C585.899 441.557 613.787 441.557 641.543 439.329L650.489 438.608C661.516 437.716 672.207 434.377 681.781 428.833C691.356 423.288 699.573 415.679 705.837 406.559L710.932 399.17C726.731 376.243 740.674 352.092 752.632 326.946L756.482 318.852C761.225 308.869 763.688 297.955 763.688 286.902C763.688 275.849 761.225 264.935 756.482 254.951L752.632 246.89Z" fill="white"/>
      <mask id="mask0_1_24" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="446" y="142" width="307" height="289">
      <path d="M742.673 249.319C731.507 225.839 718.487 203.286 703.734 181.876L698.976 175.036C693.117 166.537 685.439 159.449 676.499 154.288C667.559 149.127 657.581 146.023 647.291 145.201L638.937 144.528C613.018 142.447 586.976 142.447 561.058 144.528L552.704 145.201C542.414 146.023 532.437 149.127 523.496 154.288C514.556 159.449 506.878 166.537 501.02 175.036L496.262 181.937C481.509 203.347 468.488 225.9 457.322 249.381L453.727 256.939C449.296 266.261 446.998 276.453 446.998 286.775C446.998 297.096 449.296 307.288 453.727 316.61L457.322 324.168C468.488 347.65 481.509 370.203 496.262 391.612L501.02 398.513C506.878 407.012 514.556 414.101 523.496 419.261C532.437 424.422 542.414 427.527 552.704 428.348L561.058 429.021C586.976 431.102 613.018 431.102 638.937 429.021L647.291 428.348C657.588 427.516 667.572 424.398 676.512 419.22C685.453 414.042 693.126 406.937 698.976 398.421L703.734 391.52C718.487 370.111 731.507 347.558 742.673 324.077L746.269 316.518C750.698 307.196 752.998 297.004 752.998 286.683C752.998 276.361 750.698 266.169 746.269 256.847L742.673 249.319Z" fill="white"/>
      </mask>
      <g mask="url(#mask0_1_24)">
      <rect x="447" y="132.756" width="305.604" height="305.604" fill="url(#hexagon)"/>
      </g>
      <defs>
      <pattern id="Backround" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlink:href="#backroundimage" transform="translate(0 -0.452381) scale(0.015625 0.0297619)"/>
      </pattern>
      <pattern id="hexagon" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlink:href="#hexagonimage" transform="translate(-1.98598) scale(0.00233645)"/>
      </pattern>
      <image id="backroundimage" width="64" height="64" xlink:href="${bg}"/>
      <image id="hexagonimage" width="2128" height="428" xlink:href="${fg}"/>
      </defs>
  </svg>`
      await initialize(wasm).catch((e: Error) => {
        //We don't log the expected error
        if (!e.message.startsWith('Already initialized.')) console.error(e)
      })
      const ogImage = await svg2png(svg)
      // return new Response(ogImage, { headers: { 'content-type': 'image/png' } })

      const id = await crypto.subtle
        .digest('SHA-256', ogImage)
        .then((digest) =>
          [...new Uint8Array(digest)]
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
        )

      //upload to CF images and return the URL
      var formData = new FormData()
      formData.append('file', new Blob([ogImage], { type: 'image/png' }))
      formData.append('id', id)
      const imageUrlJson = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.TOKEN_CLOUDFLARE_API}`,
          },
          body: formData,
        }
      )
        .then((res) =>
          res.json<{
            success: boolean
            result: { variants: string[] }
            errors: any
          }>()
        )
        .catch((e) => {
          console.error("Couldn't upload og image to CF")
        })

      //prob already exsists
      if (!imageUrlJson?.success) {
        console.log('Constructing og image', imageUrlJson)
        const cached = `https://imagedelivery.net/${env.HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID}/${id}/public`

        return new Response(cached, {
          headers: { 'content-type': 'text/plain' },
        })
      }

      return new Response(
        imageUrlJson.result.variants.filter((v) => v.includes('public'))[0],
        {
          headers: { 'content-type': 'text/plain' },
        }
      )
    }
  )
  .get(
    '/gradient/:address',
    async (
      request: { params: { address: string } } & Request,
      env: Env,
      ctx: ExecutionContext
    ) => {
      //Hash input to 42 char in length
      const hash = keccak256(new TextEncoder().encode(request.params.address))

      // turn address inti UInt8Array and pick colors for color list
      const data = new TextEncoder().encode(hash)

      console.log(request.params.address, { data })

      const reduce = (a: number, b: number) => {
        if (a % 2) {
          return a + b
        }
        return a - b
      }

      const rowOne = Math.min(
        Math.max(0, Math.floor(data.slice(2, 12).reduce(reduce))),
        255
      )
      const rowTwo = Math.min(
        Math.max(Math.floor(data.slice(12, 22).reduce(reduce))),
        255
      )
      const rowFour = Math.min(
        Math.max(Math.floor(data.slice(22, 32).reduce(reduce))),
        255
      )
      const rowFive = Math.min(
        Math.max(Math.floor(data.slice(32, 42).reduce(reduce))),
        255
      )

      const svg = `<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_20_82)">
        <g filter="url(#filter0_f_20_82)">initia
          <path d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z" fill="${colors[rowOne]}"></path>
          <path d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z" fill="${colors[rowTwo]}"></path>
          <path d="M320 400H400V78.75L106.2 134.75L320 400Z" fill="${colors[rowFour]}"></path>
          <path d="M400 0H128.6L106.2 134.75L400 78.75V0Z" fill="${colors[rowFive]}"></path>
        </g>
      </g>
      <defs>
        <filter id="filter0_f_20_82" x="-159.933" y="-159.933" width="719.867" height="719.867" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="79.9667" result="effect1_foregroundBlur_20_82"></feGaussianBlur>
        </filter>
      </defs>
      </svg>`
      await initialize(wasm).catch((e: any) => {
        //We don't log the expected error
        if (!e.message.startsWith('Already initialized.')) console.error(e)
      })
      const ogImage = await svg2png(svg)

      const id = await crypto.subtle
        .digest('SHA-256', ogImage)
        .then((digest) =>
          [...new Uint8Array(digest)]
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
        )

      //upload to CF images and return the URL
      var formData = new FormData()
      formData.append('file', new Blob([ogImage], { type: 'image/png' }))
      formData.append('id', id)
      const imageUrlJson = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.TOKEN_CLOUDFLARE_API}`,
          },
          body: formData,
        }
      )

      let responseJSON = null
      if (imageUrlJson.status === 409) {
        //If image has previously been uploaded, we get a HTTP 409, so we return the cached one
        const cached = `https://imagedelivery.net/${env.HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID}/${id}/public`
        responseJSON = {
          success: false,
          result: { variants: [cached] },
        }
      } else {
        responseJSON = await imageUrlJson.json<{
          success: boolean
          result: { variants: string[] }
          errors: any
        }>()
      }

      const res = new Response(
        responseJSON.result.variants.filter((v) => v.includes('public'))[0],
        {
          headers: { 'content-type': 'text/plain' },
        }
      )
      return res
    }
  )
  .post(
    '/uploadImageBlob',
    async (request: Request, env: Env, ctx: ExecutionContext) => {
      console.log('New request on /uploadImageBlob')
      const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${env.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`
      const contentType = request.headers.get('content-type')
      if (!contentType?.startsWith('multipart/form-data'))
        throw new Error('Bad request: Expecting form data in request.')

      let reqFormData = null
      try {
        reqFormData = await request.formData()
        if (!reqFormData) throw new Error('No formdata found in request.')
      } catch (e) {
        console.error('Could not parse form data from request.', e)
        return
      }
      const reqBlob = reqFormData.get('imageBlob')
      if (!reqBlob)
        throw new Error('Bad request: Expected image blob in request.')

      const formData = new FormData()
      formData.append('file', reqBlob)

      const uploadRequest = new Request(uploadURL, {
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

      let result = null
      try {
        const response = await fetch(uploadRequest)
        const responseJson = await response.json<CFImageUploadResponse>()
        if (!responseJson.success || !responseJson.result?.variants)
          throw new Error('Upload unsuccessful', { cause: response.statusText })

        //There should be only one variant, as we haven't defined others
        result = JSON.stringify({ imageUrl: responseJson.result.variants[0] })
      } catch (e) {
        console.error('Could not send upload image blob to Image cache.', e)
      }

      return new Response(result, {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    }
  )
  .get('*', () => new Response('Not found', { status: 404 }))

export default { fetch: router.handle }
