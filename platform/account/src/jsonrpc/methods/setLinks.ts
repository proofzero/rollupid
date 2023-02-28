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
  // if user is calling this method with the same accountURN in jwt
  // TODO: validate JWT in "ValidateJWT" middleware
  if (ctx.accountURN === input.name) {
    // Don't need to await it
    // Fire and go
    ctx.account?.class.setLinks(input.links)
  }
  return
}
