import { z } from 'zod'
import { Context } from '../../context'

import type { AddressList } from '../../types'
import type { AccountURN } from '@proofzero/urns/account'

export type HasAddressesParams = {
  account: AccountURN
  addresses: AddressList
}

export const IsValidInput = z.void()
export const IsValidOutput = z.boolean()

export type IsValidOutput = z.infer<typeof IsValidOutput>

export const isValidMethod = async ({
  ctx,
}: {
  ctx: Context
}): Promise<IsValidOutput> => {
  //Relies on injectAccountNode middleware
  const profile = ctx.accountNode?.class.getProfile()
  const addresses = ctx.accountNode?.class.getAddresses()

  const result = await Promise.all([profile, addresses])
  //Return true if either of the calls above aren't falsy
  return result.some((i) => !!i)
}
