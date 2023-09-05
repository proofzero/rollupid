import { z } from 'zod'
import { Context } from '../../context'
import { AccountNode, WebauthnAccount } from '../../nodes'

export const GetWebAuthNDataOutput = z.any()

export const getWebAuthNDataMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<z.infer<typeof GetWebAuthNDataOutput>> => {
  const nodeClient = new WebauthnAccount(ctx.account as AccountNode, ctx)
  const data = await nodeClient.getData()
  return data
}
