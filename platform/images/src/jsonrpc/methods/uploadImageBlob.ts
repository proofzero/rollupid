import { z } from 'zod'
import { Context } from '../../context'
import { AccountOrApplicationURNSchema } from '../../types'
import { getUniqueCFIdForEntity } from '../../utils'

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

export const uploadImageInput = z.object({
  imageURLOrBlob: z.custom<Blob>((val) => val instanceof Blob).or(z.string()),
  entity: AccountOrApplicationURNSchema,
})

export type uploadImageInputParams = z.infer<typeof uploadImageInput>

export const uploadImageMethodOutput = z.string().nullable().optional()

export type uploadImageMethodParams = z.infer<typeof uploadImageMethodOutput>

export const uploadImageMethod = async ({
  input,
  ctx,
}: {
  input: uploadImageInputParams
  ctx: Context
}): Promise<uploadImageMethodParams> => {
  console.log('New request on /uploadImageBlob')
  const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`

  const formData = new FormData()

  if (input.imageURLOrBlob instanceof Blob) {
    formData.append('file', input.imageURLOrBlob)
  } else {
    formData.append('url', input.imageURLOrBlob)
  }

  const id = await getUniqueCFIdForEntity(input.entity)
  formData.append('id', id)

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
