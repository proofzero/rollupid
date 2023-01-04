import { z } from 'zod'
import { Context } from '../../context'
import { initReplyMessageByName } from '../../nodes'

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
  const node = await initReplyMessageByName(
    ctx.KEY_REPLY_MESSAGE as string,
    ctx.ReplyMessage
  )
  await node.class.schedule(input.message, input.delay)

  return { message: input.message, delay: input.delay }
}
