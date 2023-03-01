import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { GallerySchema } from '../validators/profile'

export const SetGalleryInput = z.object({
  name: inputValidators.AccountURNInput,
  gallery: GallerySchema,
})

export const setGalleryMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetGalleryInput>
  ctx: Context
}): Promise<void> => {
  // if user is calling this method with the same accountURN in jwt
  // TODO: validate JWT in "ValidateJWT" middleware
  if (ctx.accountURN === input.name) {
    await ctx.account?.class.setGallery(input.gallery)
  }

  return
}
