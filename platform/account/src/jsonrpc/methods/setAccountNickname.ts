import { z } from 'zod'
import { Context } from '../../context'

export const SetAccountNicknameInput = z.object({
  nickname: z.string(),
})

export const setAccountNicknameMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetAccountNicknameInput>
  ctx: Context
}): Promise<void> => {
  await ctx.account?.class.setNickname(input.nickname)
}
