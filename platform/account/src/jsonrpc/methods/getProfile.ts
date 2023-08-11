import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { appRouter } from '../router'
import { ProfileSchema } from '../validators/profile'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'
import { AddressURN } from '@proofzero/urns/address'
import { AccountURN } from '@proofzero/urns/account'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

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

  const [profile, addresses] = await Promise.all([
    node.class.getProfile(),
    caller.getPublicAddresses({ account: input.account }),
  ])

  if (!profile) return null
  if (!profile.primaryAddressURN) {
    const caller = appRouter.createCaller(ctx)
    await caller.setProfile({
      name: input.account,
      profile: {
        ...profile,
        primaryAddressURN: addresses[addresses.length - 1]
          .baseUrn as AddressURN,
      },
    })
  }

  return { ...profile, addresses }
}

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
}): Promise<GetProfileBatchOutputParams> =>
  Promise.all(
    input.map(async (accountURN) => ({
      profile: await getProfileMethod({
        input: {
          account: accountURN,
        },
        ctx,
      }),
      URN: accountURN as AccountURN,
    }))
  )
