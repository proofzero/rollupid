import { z } from 'zod'
import { Context } from '../../context'

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

export const uploadImageBlobMethodOutput = z
  .custom<Response>((val) => typeof val === typeof Response)
  .nullable()
  .or(z.string())

export type uploadImageBlobMethodParams = z.infer<
  typeof uploadImageBlobMethodOutput
>

export const uploadImageBlobMethod = async ({
  ctx,
}: {
  ctx: Context
}): Promise<uploadImageBlobMethodParams> => {
  console.log('New request on /uploadImageBlob')
  const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`
  const contentType = ctx.req?.headers.get('content-type')
  if (!contentType?.startsWith('multipart/form-data'))
    throw new Error('Bad request: Expecting form data in request.')

  let reqFormData = null
  try {
    reqFormData = await ctx.req?.formData()
    if (!reqFormData) throw new Error('No form data found in request.')
  } catch (e) {
    console.error('Could not parse form data from request.', e)
    return null
  }
  const reqBlob = reqFormData.get('imageBlob')
  if (!reqBlob) throw new Error('Bad request: Expected image blob in request.')

  const formData = new FormData()
  formData.append('file', reqBlob)

  const uploadRequest = new Request(uploadURL, {
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

  return result
}
