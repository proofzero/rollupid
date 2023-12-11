import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { EDGE_APPLICATION } from '../../types'
import { InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'
import { getErrorCause } from '@proofzero/utils/errors'

export const SetExternalAppDataPackageInputSchema =
  AppClientIdParamSchema.extend({
    packageType: z.nativeEnum(ExternalAppDataPackageType).optional(),
  })
type SetExternalAppDataPackageInput = z.infer<
  typeof SetExternalAppDataPackageInputSchema
>

export const setExternalAppDataPackage = async ({
  input,
  ctx,
}: {
  input: SetExternalAppDataPackageInput
  ctx: Context
}): Promise<void> => {
  const { packageType, clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided identity.`
    )

  const caller = router.createCaller(ctx)
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

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )

  const { error } = await appDO.class.setExternalAppDataPackage(
    clientId,
    packageType
  )
  if (error) throw getErrorCause(error)
}
