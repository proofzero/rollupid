import { proxyDurable } from 'itty-durable'
import { z } from 'zod'
import { Context } from '../../context'
import ReplyMessage from '../../nodes/replyMessage'

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
  const proxy = await proxyDurable(ctx.ReplyMessage, {
    name: 'reply-message',
    class: ReplyMessage,
    parse: true,
  })

  const node = proxy.get(ctx.KEY_REPLY_MESSAGE) as ReplyMessage
  const message = await node.message()

  if (!message) throw new Error('no message found')

  return { message }
}
