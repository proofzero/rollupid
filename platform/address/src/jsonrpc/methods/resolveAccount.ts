import { z } from 'zod'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { ACCOUNT_OPTIONS } from '../../constants'
import { Context } from '../../context'
import { appRouter } from '../router'

import { WriteAnalyticsDataPoint } from '@kubelt/platform-clients/analytics'

import * as jose from 'jose'

export const ResolveAccountInput = z.object({
  jwt: z.string().optional(),
})

export const ResolveAccountOutput = AccountURNInput

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
  if (!resultURN) {
    let urn: AccountURN
    if (input.jwt) {
      const decodedJwt = jose.decodeJwt(input.jwt)
      urn = decodedJwt.sub as AccountURN
    } else {
      const name = hexlify(randomBytes(ACCOUNT_OPTIONS.length))
      urn = AccountURNSpace.componentizedUrn(name)
      eventName = 'account-created'
    }

    const caller = appRouter.createCaller(ctx)
    await caller.setAccount(urn) // this will lazy create an account node when account worker is called

    // DISABLING FOR NOW UNTIL WE FIGURE SOLVE FOR VAULT AUTH SCOPES
    // await caller.initVault()

    resultURN = urn
  }

  // TODO: use "caller" for create so we don't need these special cases
  WriteAnalyticsDataPoint(ctx, {
    blobs: [ctx.alias, resultURN, eventName],
  } as AnalyticsEngineDataPoint)

  return resultURN
}
