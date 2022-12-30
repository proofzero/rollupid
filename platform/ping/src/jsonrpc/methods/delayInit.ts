import { proxyDurable } from 'itty-durable'
import { z } from 'zod'
import { Context } from '../../context'
import ReplyMessage from '../../nodes/replyMessage'

export const DelayInitInputOutput = z.object({
  delay: z.number(),
  message: z.string(),
})

export type DelayInitParams = z.infer<typeof DelayInitInputOutput>

export const delayInitMethod = async ({
  input,
  ctx,
}: {
  input: DelayInitParams
  ctx: Context
}) => {
  const proxy = await proxyDurable(ctx.ReplyMessage, {
    name: 'reply-message',
    class: ReplyMessage,
    parse: true,
  })

  const node = proxy.get(ctx.KEY_REPLY_MESSAGE) as ReplyMessage
  await node.schedule(input.message, input.delay)

  return { message: input.message, delay: input.delay }
}
