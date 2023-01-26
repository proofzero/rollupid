import { z } from 'zod'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { ACCOUNT_OPTIONS } from '../../constants'
import { Context } from '../../context'
import { appRouter } from '../router'

import { WriteAnalyticsDataPoint } from '@kubelt/platform-clients/analytics'

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

  let resultURN: AccountURN
  let eventName: string

  const stored = await nodeClient?.storage.get<AccountURN>('account')
  if (stored) {
    if (AccountURNSpace.is(stored)) {
      eventName = 'account-stored'
      resultURN = stored
    } else {
      const urn = AccountURNSpace.componentizedUrn(stored)
      nodeClient?.storage.put('account', urn)
      eventName = 'account-created-space'
      resultURN = urn
    }
  } else {
    const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
    const urn = AccountURNSpace.componentizedUrn(name)

    const caller = appRouter.createCaller(ctx)
    await caller.setAccount(urn)
    await caller.initVault()

    eventName = 'account-created-vault'
    resultURN = urn
  }

  WriteAnalyticsDataPoint(ctx, {
    blobs: [ctx.alias, resultURN, eventName],
  } as AnalyticsEngineDataPoint)

  return resultURN
}
