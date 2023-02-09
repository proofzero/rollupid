import z from 'zod'
import { Context } from '../../context'
import { AccountOrApplicationURNSchema } from '../../types'
import { getUniqueCFIdForEntity } from '../../utils'

export const PrecomputedImageURLOutput = z.string()
export type PrecomputedImageURLOutputParam = z.infer<
  typeof PrecomputedImageURLOutput
>

export const PrecomputedImageURLInput = z.object({
  entity: AccountOrApplicationURNSchema,
})
export type PrecomputedImageURLInputParam = z.infer<
  typeof PrecomputedImageURLInput
>

export const getPrecomputedImageURL = async ({
  input,
  ctx,
}: {
  input: PrecomputedImageURLInputParam
  ctx: Context
}): Promise<PrecomputedImageURLOutputParam> => {
  if (!input.entity) {
    throw new Error('getPrecomputedImageURL: No input entity provided')
  }
  const id = getUniqueCFIdForEntity(input.entity)
  return `https://imagedelivery.net/${ctx.HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID}/${id}/public`
}
