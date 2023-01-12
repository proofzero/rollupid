import { z } from 'zod'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { ACCOUNT_OPTIONS } from '../../constants'
import { Context } from '../../context'
import { appRouter } from '../router'

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

  const stored = await nodeClient?.storage.get<AccountURN>('account')
  if (stored) {
    if (AccountURNSpace.is(stored)) {
      return stored
    } else {
      const urn = AccountURNSpace.urn(stored)
      nodeClient?.storage.put('account', urn)
      return urn
    }
  } else {
    const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
    const urn = AccountURNSpace.urn(name)

    const caller = appRouter.createCaller(ctx)
    caller.setAccount(urn)

    return urn
  }
}
