import { z } from 'zod'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

import { ACCOUNT_OPTIONS } from '../../constants'
import { Context } from '../../context'
import { appRouter } from '../router'

import { WriteAnalyticsDataPoint } from '@proofzero/platform-clients/analytics'

import * as jose from 'jose'

export const ResolveAccountInput = z.object({
  jwt: z.string().optional(),
  force: z.boolean().optional().default(false),
})

export const ResolveAccountOutput = z.object({
  accountURN: AccountURNInput,
  existing: z.boolean(),
})

type ResolveAccountParams = z.infer<typeof ResolveAccountInput>
type ResolveAccountResult = z.infer<typeof ResolveAccountOutput>

// NOTE: this method should only be called for new users
export const resolveAccountMethod = async ({
  input,
  ctx,
}: {
  input: ResolveAccountParams
  ctx: Context
}): Promise<ResolveAccountResult> => {
  const nodeClient = ctx.address

  let eventName = 'account-resolved'

  let resultURN = await nodeClient?.storage.get<AccountURN>('account')
  if (input.jwt && resultURN) {
    return {
      accountURN: resultURN,
      existing: true,
    }
  }

  if (!resultURN) {
    let urn: AccountURN
    if (input.jwt && !input.force) {
      const decodedJwt = jose.decodeJwt(input.jwt)
      urn = decodedJwt.sub as AccountURN
    } else {
      const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
      urn = AccountURNSpace.componentizedUrn(name)
      eventName = 'account-created'
    }
    const caller = appRouter.createCaller(ctx)
    await caller.setAccount(urn) // this will lazy create an account node when account worker is called
    await caller.initSmartContractWallet()

    resultURN = urn
  }

  // TODO: use "caller" for create so we don't need these special cases
  WriteAnalyticsDataPoint(ctx, {
    blobs: [ctx.alias, resultURN, eventName],
  } as AnalyticsEngineDataPoint)

  return {
    accountURN: resultURN,
    existing: false,
  }
}
