import { z } from 'zod'
import { Context } from '../../context'
import { AccountNode, WebauthnAccount } from '../../nodes'

export const SetWebAuthNInput = z.any()

export const setWebAuthNDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetWebAuthNInput>
  ctx: Context
}): Promise<void> => {
  const nodeClient = new WebauthnAccount(ctx.account as AccountNode)
  await nodeClient.setData(input)
}
