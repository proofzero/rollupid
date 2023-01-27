import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { LinksSchema } from '../validators/profile'

export const GetLinksInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const GetLinksOutput = LinksSchema.nullable()

export type GetLinksOutputParams = z.infer<typeof GetLinksOutput>

export type GetLinksParams = z.infer<typeof GetLinksInput>

export const getLinksMethod = async ({
  input,
  ctx,
}: {
  input: GetLinksParams
  ctx: Context
}): Promise<GetLinksOutputParams> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)

  const links = await node.class.getLinks()

  if (!links) return null

  return links
}
