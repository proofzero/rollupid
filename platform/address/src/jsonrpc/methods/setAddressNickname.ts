import { z } from 'zod'
import { Context } from '../../context'

export const SetAddressNicknameInput = z.object({
  nickname: z.string(),
})

export const setAddressNicknameMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetAddressNicknameInput>
  ctx: Context
}): Promise<void> => {
  await ctx.address?.class.setNickname(input.nickname)
}
