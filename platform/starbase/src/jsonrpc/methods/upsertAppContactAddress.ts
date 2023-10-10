import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

export const UpsertAppContactAddressInput = z.object({
  clientId: z.string(),
  account: AccountURNInput,
})

type UpsertAppContactAddressParams = z.infer<
  typeof UpsertAppContactAddressInput
>

export const upsertAppContactAddress = async ({
  input,
  ctx,
}: {
  input: UpsertAppContactAddressParams
  ctx: Context
}): Promise<void> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const caller = router.createCaller(ctx)

  await groupAdminValidatorByAppURN(ctx, appURN)

  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (edges.length > 1) {
    console.warn('More than one account found for app', input.clientId)
  }

  for (let i = 0; i < edges.length; i++) {
    await caller.edges.removeEdge({
      tag: EDGE_HAS_REFERENCE_TO,
      src: edges[i].src.baseUrn,
      dst: edges[i].dst.baseUrn,
    })
  }

  await caller.edges.makeEdge({
    src: appURN,
    dst: input.account,
    tag: EDGE_HAS_REFERENCE_TO,
  })
}
