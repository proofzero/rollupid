import { z } from 'zod'
import { Context } from '../../context'

export const DeleteMethodInputSchema = z.string()
export type DeleteMethodInputParams = z.infer<typeof DeleteMethodInputSchema>

export const DeleteMethodOutputSchema = z.boolean()
export type DeleteMethodOutputParams = z.infer<typeof DeleteMethodOutputSchema>

export const deleteMethod = async ({
  input,
  ctx,
}: {
  input: DeleteMethodInputParams
  ctx: Context
}): Promise<DeleteMethodOutputParams> => {
  // A typical image delivery URL looks like this:
  // https://imagedelivery.net/<ACCOUNT_HASH>/<IMAGE_ID>/<VARIANT_NAME>
  const imageComponents = input.split('/')
  const imageID = imageComponents[imageComponents.length - 2]

  const url = `https://api.cloudflare.com/client/v4/accounts/${ctx.INTERNAL_CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageID}`
  const deleteRequest = new Request(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${ctx.TOKEN_CLOUDFLARE_API}`,
    },
  })

  const response = await fetch(deleteRequest)
  const res = (await response.json()) as {
    success: boolean
  }

  return res.success
}
