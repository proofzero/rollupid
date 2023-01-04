import { z } from 'zod'
import { Context } from '../../context'
import { initReplyMessageByName } from '../../nodes'

export const PingOutput = z.object({
  message: z.string(),
})

export const pingMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}) => {
  const node = await initReplyMessageByName(
    ctx.KEY_REPLY_MESSAGE as string,
    ctx.ReplyMessage
  )
  const message = await node.class.message()

  if (!message) throw new Error('no message found')

  return { message }
}
