import { z } from 'zod'
import { Context } from '../../context'

import type { AccountList } from '../../types'
import type { IdentityURN } from '@proofzero/urns/identity'

export type HasAccountsParams = {
  identity: IdentityURN
  accounts: AccountList
}

export const IsValidInput = z.void()
export const IsValidOutput = z.boolean()

export type IsValidOutput = z.infer<typeof IsValidOutput>

export const isValidMethod = async ({
  ctx,
}: {
  ctx: Context
}): Promise<IsValidOutput> => {
  //Relies on injectIdentityNode middleware
  const profile = ctx.identityNode?.class.getProfile()
  const accounts = ctx.identityNode?.class.getAccounts()

  const result = await Promise.all([profile, accounts])
  //Return true if either of the calls above aren't falsy
  return result.some((i) => !!i)
}
