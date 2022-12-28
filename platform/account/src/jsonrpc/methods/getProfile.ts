import { z } from 'zod'
import { AccountURN } from '@kubelt/urns/account'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import Account from '../../nodes/account'
import { proxyDurable } from 'itty-durable'

export type GetProfileParams = {
  account: AccountURN
}

export const GetProfileInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const getProfileMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileParams
  ctx: Context
}) => {
  const proxy = await proxyDurable(ctx.Account, {
    name: 'account',
    class: Account,
    parse: true,
  })

  const node = proxy.get(input.account) as Account

  const profile = await node.getProfile()
  return profile
}
