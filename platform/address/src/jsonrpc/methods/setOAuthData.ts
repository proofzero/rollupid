import { z } from 'zod'
import { Context } from '../../context'
import { OAuthDataSchema } from '../validators/oauth'
import { AddressNode } from '../../nodes'
import OAuthAddress from '../../nodes/oauth'

export const SetOAuthDataInput = OAuthDataSchema

export const setOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof OAuthDataSchema>
  ctx: Context
}): Promise<void> => {
  const nodeClient = new OAuthAddress(ctx.address as AddressNode)
  await nodeClient.setData(input)
}
