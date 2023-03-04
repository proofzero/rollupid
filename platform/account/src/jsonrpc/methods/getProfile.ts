import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { appRouter } from '../router'
import { ProfileSchema } from '../validators/profile'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'
import { AccountURNSpace } from '@kubelt/urns/account'

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

  console.debug({ profile, addresses })
  const qcomps = {
    name: profile.displayName,
    picture: profile.pfp?.image,
  }
  const enhancedUrn = AccountURNSpace.componentizedUrn(
    AccountURNSpace.decode(input.account),
    undefined,
    qcomps
  )

  const edge = ctx.edges
  await edge.updateNode.mutate({ urnOfNode: enhancedUrn })

  return { ...profile, addresses, handle: undefined }
}
