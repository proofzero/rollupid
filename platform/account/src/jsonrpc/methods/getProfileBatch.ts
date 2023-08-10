import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { appRouter } from '../router'
import { ProfileSchema } from '../validators/profile'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AccountURN } from '@proofzero/urns/account'

export const GetProfileBatchInput = z.array(inputValidators.AccountURNInput)
export const GetProfileBatchOutput = z.array(
  z.object({
    profile: ProfileSchema.merge(
      z.object({
        addresses: z.array(Node),
      })
    ).nullable(),
    URN: AccountURNInput,
  })
)

export type GetProfileBatchOutputParams = z.infer<typeof GetProfileBatchOutput>
export type GetProfileBatchParams = z.infer<typeof GetProfileBatchInput>

export const getProfileBatchMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileBatchParams
  ctx: Context
}): Promise<GetProfileBatchOutputParams> => {
  const caller = appRouter.createCaller(ctx)

  return Promise.all(
    input.map(async (accountURN) => ({
      profile: await caller.getProfile({
        account: accountURN,
      }),
      URN: accountURN as AccountURN,
    }))
  )
}
