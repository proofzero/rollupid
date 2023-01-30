import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { LinksSchema } from '../validators/profile'

export const SetLinksInput = z.object({
  name: inputValidators.AccountURNInput,
  links: LinksSchema,
})

export const setLinksMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetLinksInput>
  ctx: Context
}): Promise<void> => {
  await ctx.account?.class.setLinks(input.links)
  return
}
