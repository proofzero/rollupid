import { z } from 'zod'
import { Context } from '../../context'
import { OAuthDataSchema } from '../validators/oauth'
import { AccountNode } from '../../nodes'
import OAuthAccount from '../../nodes/oauth'

export const SetOAuthDataInput = OAuthDataSchema

export const setOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof OAuthDataSchema>
  ctx: Context
}): Promise<void> => {
  const nodeClient = new OAuthAccount(ctx.account as AccountNode)
  await nodeClient.setData(input)
}
