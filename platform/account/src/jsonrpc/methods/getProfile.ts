import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import Account from '../../nodes/account'
import { proxyDurable } from 'itty-durable'
import type { Profile } from '../middlewares/profile'
import { initAccountNodeByName } from '../../nodes'

export const GetProfileInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type GetProfileParams = z.infer<typeof GetProfileInput>

export const getProfileMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetProfileInput>
  ctx: Context
}): Promise<Profile | null> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)
  const result = await node.getProfile()
  return result
}
