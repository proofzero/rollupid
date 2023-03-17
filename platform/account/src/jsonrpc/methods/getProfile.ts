import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { appRouter } from '../router'
import { ProfileSchema } from '../validators/profile'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const GetProfileInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const GetProfileOutput = ProfileSchema.merge(
  z.object({
    addresses: z.array(Node),
  })
).nullable()

export type GetProfileOutputParams = z.infer<typeof GetProfileOutput>

export type GetProfileParams = z.infer<typeof GetProfileInput>

export const getProfileMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileParams
  ctx: Context
}): Promise<GetProfileOutputParams> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)
  const caller = appRouter.createCaller(ctx)

  const getAddressesCall =
    ctx.accountURN === input.account
      ? caller.getOwnAddresses
      : caller.getPublicAddresses

  const [profile, addresses] = await Promise.all([
    node.class.getProfile(),
    getAddressesCall({ account: input.account }),
  ])
  if (!profile) return null

  return { ...profile, addresses }
}
