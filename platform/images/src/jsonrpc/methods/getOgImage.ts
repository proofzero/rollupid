import { z } from 'zod'
//@ts-ignore
import wasm from '../../assets/svg2png_wasm_bg.wasm'
import { svg2png, initialize } from 'svg2png-wasm'
import { Context } from '../../context'
//@ts-ignore
import bg from '../../assets/ogBackgroundB64'

export const getOgImageMethodInput = z.object({
  fgUrl: z.string().url(),
})
export type getOgImageParams = z.infer<typeof getOgImageMethodInput>

export const getOgImageMethodOutput = z.string()
export type getOgImageOutputParams = z.infer<typeof getOgImageMethodOutput>

export const getOgImageMethod = async ({
  input,
  ctx,
}: {
  input: getOgImageParams
  ctx: Context
}): Promise<getOgImageOutputParams> => {
  const cache = caches.default
  const cached_ = await cache.match(ctx.req!)
  if (cached_) {
    console.log({ status: cached_.status })
    return await cached_.text()
  }

  const { fgUrl } = input
  // Attempt to download arbitrary images and encode them as data URIs with the
  // image-data-uri library. We cannot use the remote calls offered by
  // image-data-uri because it uses a legacy HTTP library that Cryptopunks 403
  // blocks when called from GCP (for some reason). We need more control so we
  // use the fetch API and pass the bytes retrieved into the library's encoder.
  const encodeDataURI = async (url: string) => {
    return (
      fetch(url)
        // Get the content type and unfortunately await the body. I would prefer
        // that retrieving the body here was then enable, but need the header.
        .then(async (r) => [
          r.headers.get('content-type'),
          await r.arrayBuffer(),
        ])

        // Encode the bytes into a data URI, given their content type.
        .then(([contentType, hexBuffer]) => {
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
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.TOKEN_CLOUDFLARE_API}`,
      },
      body: formData,
    }
  )
    .then(async (res) => {
      if (res.status === 409) {
        console.log('OG image already exists.')
        return
      }
      return res.json<{
        success: boolean
        result: { variants: string[] }
        errors: any
      }>()
    })
    .catch((e) => {
      console.error("Couldn't upload og image to CF")
      console.error(e)
    })

  // We cache it with upload
  // So might as well just return a cached URL
  const cached = `https://imagedelivery.net/${ctx.HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID}/${id}/public`

  // Caching strategy
  await cache.put(
    ctx.req!,
    new Response(cached, {
      status: 200,
      statusText: 'All good',
    })
  )

  return cached
}
