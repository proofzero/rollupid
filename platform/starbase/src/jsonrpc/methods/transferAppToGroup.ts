import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import {
  AccountURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { BadRequestError } from '@proofzero/errors'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export const TransferAppToGroupInput = z.object({
  clientID: z.string(),
  identityGroupURN: IdentityGroupURNValidator,
  emailURN: AccountURNInput.optional().nullable(),
})

type TransferAppToGroupParams = z.infer<typeof TransferAppToGroupInput>

export const transferAppToGroup = async ({
  input,
  ctx,
}: {
  input: TransferAppToGroupParams
  ctx: Context
}): Promise<void> => {
  const { clientID, identityGroupURN, emailURN } = input

  if (!ctx.identityURN) {
    throw new BadRequestError({
      message: 'Request received without identityURN.',
    })
  }

  const appURN = ApplicationURNSpace.componentizedUrn(clientID)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new BadRequestError({
      message: `Request received for clientId ${clientID} which is not owned by provided account.`,
    })

  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: appURN },
      src: {
        baseUrn: ctx.identityURN,
      },
    },
  })

  await Promise.all(
    edges.map(async (edge) => {
      await caller.edges.makeEdge({
        src: identityGroupURN,
        tag: edge.tag,
        dst: edge.dst.baseUrn,
      })

      await caller.edges.removeEdge({
        src: edge.src.baseUrn,
        tag: edge.tag,
        dst: edge.dst.baseUrn,
      })
    })
  )

  const { edges: emailEdges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (emailURN) {
    await caller.edges.makeEdge({
      src: appURN,
      tag: EDGE_HAS_REFERENCE_TO,
      dst: emailURN,
    })

    await Promise.all(
      emailEdges.map(async (edge) => {
        await caller.edges.removeEdge({
          src: edge.src.baseUrn,
          tag: edge.tag,
          dst: edge.dst.baseUrn,
        })
      })
    )
  }
}
