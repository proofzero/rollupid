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
  blob: z.string(),
})

export type uploadImageBlobInputParams = z.infer<typeof uploadImageBlobInput>

export const uploadImageBlobMethodOutput = z.string().nullable().optional()

export type uploadImageBlobMethodParams = z.infer<
  typeof uploadImageBlobMethodOutput
>

// as of now trpc does not support blobs, so we use b64 on client and
// convert it to blob here

const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

export const uploadImageBlobMethod = async ({
  input,
  ctx,
}: {
  input: uploadImageBlobInputParams
  ctx: Context
}): Promise<uploadImageBlobMethodParams> => {
  console.log('New request on /uploadImageBlob')
  const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1`

  const reqBlob = b64toBlob(input.blob, 'image')
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
    result = responseJson.result.variants[0]
  } catch (e) {
    console.error('Could not send upload image blob to Image cache.', e)
  }

  return result
}
