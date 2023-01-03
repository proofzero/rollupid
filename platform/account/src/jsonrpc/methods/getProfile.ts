import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import Account from '../../nodes/account'
import { proxyDurable } from 'itty-durable'
import type { Profile } from '../middlewares/profile'

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
  const proxy = await proxyDurable(ctx.Account, {
    name: 'account',
    class: Account,
    parse: true,
  })

  const node = proxy.get(input.account)
  const result = await node.getProfile()
  return result
}
