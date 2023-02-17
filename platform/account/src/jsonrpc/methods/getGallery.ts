import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { GallerySchema } from '../validators/profile'

export const GetGalleryInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const GetGalleryOutput = GallerySchema.nullable()

export type GetGalleryOutputParams = z.infer<typeof GetGalleryOutput>

export type GetGalleryParams = z.infer<typeof GetGalleryInput>

export const getGalleryMethod = async ({
  input,
  ctx,
}: {
  input: GetGalleryParams
  ctx: Context
}): Promise<GetGalleryOutputParams> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)

  const gallery = await node.class.getGallery()

  console.log({ gallery })

  if (!gallery) return null

  return gallery
}
