import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { InternalServerError } from '@proofzero/errors'
import { EDGE_APPLICATION } from '../../types'

export const TransferAppToGroupInput = z.object({
  clientID: z.string(),
  identityGroupURN: IdentityGroupURNValidator,
})

type TransferAppToGroupParams = z.infer<typeof TransferAppToGroupInput>

export const transferAppToGroup = async ({
  input,
  ctx,
}: {
  input: TransferAppToGroupParams
  ctx: Context
}): Promise<void> => {
  const { clientID, identityGroupURN } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientID)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new InternalServerError({
      message: `Request received for clientId ${clientID} which is not owned by provided account.`,
    })

  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: appURN },
      tag: EDGE_APPLICATION,
    },
  })

  if (edges.length === 0) {
    console.warn('No ownership edge found for ', appURN)
  }

  if (edges.length > 1) {
    console.warn('More than one ownership edge found for ', appURN)
  }

  await caller.edges.makeEdge({
    src: identityGroupURN,
    dst: appURN,
    tag: EDGE_APPLICATION,
  })

  await Promise.all(
    edges.map((edge) =>
      caller.edges.removeEdge({
        src: edge.src.baseUrn,
        tag: EDGE_APPLICATION,
        dst: edge.dst.baseUrn,
      })
    )
  )
}
