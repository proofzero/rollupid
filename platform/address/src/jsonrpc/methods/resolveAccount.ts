import { z } from 'zod'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN } from '@kubelt/urns/account'
import { Context } from '../../context'

export const ResolveAccountOutput = AccountURNInput

type ResolveAccountResult = z.infer<typeof ResolveAccountOutput>

export const resolveAccountMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<ResolveAccountResult> => {
  const nodeClient = ctx.address
  const account = (await nodeClient?.class.resolveAccount()) as AccountURN
  return account
}
