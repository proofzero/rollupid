import { proxyDurable } from 'itty-durable'
import { z } from 'zod'
import { Context } from '../../context'
import ReplyMessage from '../../nodes/replyMessage'

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
  const proxy = await proxyDurable(ctx.ReplyMessage, {
    name: 'reply-message',
    class: ReplyMessage,
    parse: true,
  })

  const node = proxy.get(ctx.KEY_REPLY_MESSAGE) as ReplyMessage
  await node.init(input.message)

  return { message: input.message }
}
