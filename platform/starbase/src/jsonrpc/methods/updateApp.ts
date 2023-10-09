import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppObjectSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { InternalServerError } from '@proofzero/errors'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { EDGE_APPLICATION } from '../../types'

export const UpdateAppInput = z.object({
  clientId: z.string(),
  updates: AppObjectSchema.partial(),
})

export const updateApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof UpdateAppInput>
  ctx: Context
}): Promise<void> => {
  const appURN = ApplicationURNSpace.componentizedUrn(
    input.clientId,
    undefined,
    { name: input.updates.name, iconURL: input.updates.icon }
  )
  if (
    !ctx.allAppURNs ||
    !ctx.allAppURNs.includes(ApplicationURNSpace.getBaseURN(appURN))
  )
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const caller = router.createCaller(ctx)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: ApplicationURNSpace.getBaseURN(appURN) },
      tag: EDGE_APPLICATION,
    },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await identityGroupAdminValidator(ctx, ownershipURN as IdentityGroupURN)
  }

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  appDO.class.update(input.updates)

  //TODO: Make this asynchronous so user doesn't have to wait for the second IO hop
  await caller.edges.updateNode({ urnOfNode: appURN })
}
