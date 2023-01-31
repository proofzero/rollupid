import { z } from 'zod'

export const AuthorizeMethodInput = z.object({
  account: AccountURNInput,
  responseType: z.string(),
  clientId: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  state: z.string(),
})

export const AuthorizeMethodOutput = z.object({
  code: z.string(),
  state: z.string(),
})

export type AuthorizeParams = z.infer<typeof AuthorizeMethodInput>

export const authorizeMethod = async ({
  input,
  ctx,
}: {
  input: AuthorizeParams
  ctx: Context
}) => {
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
  if (!reqBlob) throw new Error('Bad request: Expected image blob in request.')

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
