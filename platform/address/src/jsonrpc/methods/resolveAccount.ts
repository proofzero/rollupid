import { AccountURN } from '@kubelt/urns/account'
import { Context } from '../../context'

export const resolveAccountMethod = async ({
  input,
  ctx,
}: {
  input: void
  ctx: Context
}): Promise<AccountURN | undefined> => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.resolveAccount()
  return account
}
