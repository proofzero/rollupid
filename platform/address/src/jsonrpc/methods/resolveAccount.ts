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

// NOTE: this method should only be called for new users
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
      const urn = AccountURNSpace.componentizedUrn(stored)
      nodeClient?.storage.put('account', urn)
      return urn
    }
  } else {
    const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
    const urn = AccountURNSpace.componentizedUrn(name)

    console.log('set account', { urn })

    const caller = appRouter.createCaller(ctx)
    await caller.setAccount(urn)
    await caller.initVault()

    return urn
  }
}
