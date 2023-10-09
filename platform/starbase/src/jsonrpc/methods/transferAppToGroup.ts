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
import { AccountURNSpace } from '@proofzero/urns/account'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'

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

  await identityGroupAdminValidator(ctx, identityGroupURN)

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

  if (emailURN) {
    // Get all edges of type has/refTo
    // Which should target the app's team email
    const { edges: emailEdges } = await caller.edges.getEdges({
      query: {
        src: { baseUrn: appURN },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })

    // Create a new edge using
    // the new email as a destination
    await caller.edges.makeEdge({
      src: appURN,
      tag: EDGE_HAS_REFERENCE_TO,
      dst: emailURN,
    })

    // Remove any previously linked team emails
    // This should be a single edge
    await Promise.all(
      emailEdges
        .filter((edge) => AccountURNSpace.is(edge.dst.baseUrn))
        .map(async (edge) => {
          await caller.edges.removeEdge({
            src: edge.src.baseUrn,
            tag: edge.tag,
            dst: edge.dst.baseUrn,
          })
        })
    )
  }
}
