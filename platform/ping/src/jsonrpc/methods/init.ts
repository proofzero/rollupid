import { z } from 'zod'
import { Context } from '../../context'
import { initReplyMessageByName } from '../../nodes'

export const InitInputOutput = z.object({
  message: z.string(),
})

export type InitParams = z.infer<typeof InitInputOutput>

export const initMethod = async ({
  input,
  ctx,
}: {
  input: InitParams
  ctx: Context
}) => {
  const node = await initReplyMessageByName(
    ctx.KEY_REPLY_MESSAGE as string,
    ctx.ReplyMessage
  )
  await node.class.init(input.message)

  return { message: input.message }
}
