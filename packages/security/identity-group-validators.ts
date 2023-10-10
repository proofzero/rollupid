import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform/core'
import { initIdentityGroupNodeByName } from '@proofzero/platform/identity/src/nodes'
import { EDGE_APPLICATION } from '@proofzero/platform/starbase/src/types'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import { IdentityURN } from '@proofzero/urns/identity'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { getErrorCause } from '@proofzero/utils/errors'

export const groupAdminValidatorByIdentityGroupURN = async (
  ctx: unknown & {
    identityURN?: IdentityURN
    IdentityGroup?: DurableObjectNamespace
  },
  identityGroupURN: IdentityGroupURN
) => {
  if (!ctx.identityURN) {
    throw new BadRequestError({
      message: 'No identity URN in context',
    })
  }

  if (!ctx.IdentityGroup) {
    throw new BadRequestError({
      message: 'No IdentityGroup in context',
    })
  }

  const DO = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  const { error } = await DO.class.validateAdmin(ctx.identityURN)
  if (error) {
    throw getErrorCause(error)
  }
}

export const groupAdminValidatorByClientID = async (
  ctx: unknown & {
    identityURN?: IdentityURN
    IdentityGroup?: DurableObjectNamespace
  },
  clientID: string
) => {
  const appURN = ApplicationURNSpace.componentizedUrn(clientID)

  return groupAdminValidatorByAppURN(ctx, appURN)
}

export const groupAdminValidatorByAppURN = async (
  ctx: unknown & {
    identityURN?: IdentityURN
    IdentityGroup?: DurableObjectNamespace
  },
  appURN: ApplicationURN
) => {
  const caller = router.createCaller(ctx as any)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: { dst: { baseUrn: appURN }, tag: EDGE_APPLICATION },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await groupAdminValidatorByIdentityGroupURN(
      ctx,
      ownershipURN as IdentityGroupURN
    )
  }
}
