import { z } from 'zod'
import { keccak256 } from '@ethersproject/keccak256'
import colors from '../../assets/colors.json'
import wasm from '../../assets/svg2png_wasm_bg.wasm'
import { svg2png, initialize } from 'svg2png-wasm'
import { Context } from '../../context'

export const GetGradientMethodInput = z.object({
  address: z.string(),
})
export type GetGradientParams = z.infer<typeof GetGradientMethodInput>

export const GetGradienteMethodOutput = z.object({
  code: z.string(),
  state: z.string(),
})
export type GetAddressesOutputParams = z.infer<typeof GetGradienteMethodOutput>

export const getGradientMethod = async ({
  input,
  ctx,
}: {
  input: GetGradientParams
  ctx: Context
}): Promise<GetAddressesOutputParams> => {
  const { address } = input

  //Hash input to 42 char in length
  //addresses could be of different types. not only ethereum ones
  const hash = keccak256(new TextEncoder().encode(address))

  // turn address inti UInt8Array and pick colors for color list
  const data = new TextEncoder().encode(hash)

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
    `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.TOKEN_CLOUDFLARE_API}`,
      },
      body: formData,
    }
  )

  let responseJSON = null
  if (imageUrlJson.status === 409) {
    //If image has previously been uploaded, we get a HTTP 409, so we return the cached one
    const cached = `https://imagedelivery.net/${ctx.HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID}/${id}/public`
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

  return new Response(
    responseJSON.result.variants.filter((v) => v.includes('public'))[0],
    {
      headers: { 'content-type': 'text/plain' },
    }
  )
}
