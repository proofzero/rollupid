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

export const uploadImageBlobInput = z.object({
  b64: z.string(),
})

export type uploadImageBlobInputParams = z.infer<typeof uploadImageBlobInput>

export const uploadImageBlobMethodOutput = z.string().nullable().optional()

export type uploadImageBlobMethodParams = z.infer<
  typeof uploadImageBlobMethodOutput
>

export const uploadImageBlobMethod = async ({
  input,
  ctx,
}: {
  input: uploadImageBlobInputParams
  ctx: Context
}): Promise<uploadImageBlobMethodParams> => {
  console.log('New request on /uploadImageBlob')
  const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`

  const reqBlob = await fetch(input.b64)
  if (!reqBlob) throw new Error('Bad request: Expected image blob in request.')

  const imgFile = await reqBlob.blob()

  const formData = new FormData()
  formData.append('file', imgFile)

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
    result = responseJson.result.variants[0]
  } catch (e) {
    console.error('Could not send upload image blob to Image cache.', e)
  }

  return result
}
