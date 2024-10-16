import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { initIdentityNodeByName } from '../../nodes'
import { appRouter } from '../router'
import { ProfileSchema } from '../validators/profile'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'
import { AccountURN } from '@proofzero/urns/account'
import { IdentityURN } from '@proofzero/urns/identity'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

export const GetProfileInput = z.object({
  identity: inputValidators.IdentityURNInput,
})

export const GetProfileOutput = ProfileSchema.merge(
  z.object({
    accounts: z.array(Node),
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
  let node = initIdentityNodeByName(input.identity, ctx.env.Identity)
  const forwardIdentityURN = await node.class.getForwardIdentityURN()
  if (forwardIdentityURN)
    node = initIdentityNodeByName(forwardIdentityURN, ctx.env.Identity)

  const caller = appRouter.createCaller(ctx)

  const [profile, accounts] = await Promise.all([
    node.class.getProfile(),
    caller.getPublicAccounts({ URN: input.identity }),
  ])

  if (!profile) return null
  if (!profile.primaryAccountURN) {
    const caller = appRouter.createCaller(ctx)
    await caller.setProfile({
      name: input.identity,
      profile: {
        ...profile,
        primaryAccountURN: accounts[accounts.length - 1].baseUrn as AccountURN,
      },
    })
  }

  return { ...profile, accounts }
}

export const GetProfileBatchInput = z.array(inputValidators.IdentityURNInput)
export const GetProfileBatchOutput = z.array(
  z.object({
    profile: ProfileSchema.merge(
      z.object({
        accounts: z.array(Node),
      })
    ).nullable(),
    URN: IdentityURNInput,
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
    input.map(async (identityURN) => ({
      profile: await getProfileMethod({
        input: {
          identity: identityURN,
        },
        ctx,
      }),
      URN: identityURN as IdentityURN,
    }))
  )
