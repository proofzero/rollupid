import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { BadRequestError } from '@proofzero/errors'
import { EDGE_APPLICATION } from '@proofzero/platform.starbase/src/types'

export const DeleteIdentityGroupInputSchema = IdentityGroupURNValidator
type DeleteIdentityGroupInput = z.infer<typeof DeleteIdentityGroupInputSchema>

export const deleteIdentityGroup = async ({
  input: identityGroupURN,
  ctx,
}: {
  input: DeleteIdentityGroupInput
  ctx: Context
}): Promise<void> => {
  const caller = router.createCaller(ctx)

  const { edges: membershipEdges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })

  const ownEdge = membershipEdges.find(
    (me) => me.src.baseUrn === ctx.identityURN
  )
  if (!ownEdge) {
    throw new BadRequestError({
      message: 'Caller is not part of identity group',
    })
  }

  const { edges: appEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: identityGroupURN,
      },
      tag: EDGE_APPLICATION,
    },
  })
  if (appEdges.length > 0) {
    throw new BadRequestError({
      message: `This group owns one or more apps. Please delete those apps first if
      you want to remove the group.`,
    })
  }

  await Promise.all(
    membershipEdges.map((me) =>
      caller.edges.removeEdge({
        src: me.src.baseUrn,
        tag: me.tag,
        dst: me.dst.baseUrn,
      })
    )
  )

  await caller.edges.deleteNode({
    urn: identityGroupURN,
  })

  const DO = await initIdentityGroupNodeByName(
    identityGroupURN,
    ctx.IdentityGroup
  )
  if (DO) {
    await DO.storage.deleteAll()
  }
}
