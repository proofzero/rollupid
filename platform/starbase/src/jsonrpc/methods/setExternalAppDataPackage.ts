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
import { DelQueueMessageType } from '@proofzero/platform.core/src/types'
import { ExternalAppDataPackageStatus } from '../validators/externalAppDataPackageDefinition'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import generateRandomString from '@proofzero/utils/generateRandomString'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { EDGE_AUTHORIZES } from '@proofzero/platform.authorization/src/constants'
import { edges } from '@proofzero/platform.edges/src/db'

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
    clientId,
    ctx.env.StarbaseApp
  )

  const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
  if (
    externalAppDataPackageDefinition?.status ===
    ExternalAppDataPackageStatus.Deleting
  ) {
    // Leave this commented out while doing the testing
    // throw new InternalServerError({
    //   message: 'External app data is being deleted',
    // })
  }

  const { error } = await appDO.class.setExternalAppDataPackage(
    clientId,
    packageType
  )
  if (error) throw getErrorCause(error)

  if (!packageType) {
    await ctx.env.SYNC_QUEUE.send(
      {
        type: DelQueueMessageType.SPECIALSAUCE,
        data: {
          appIDSet: [clientId],
        },
      },
      {
        contentType: 'json',
      }
    )
  }
  // else {
  //   for (let i = 0; i < 50000; i++) {
  //     const identity = IdentityURNSpace.urn(('' + i).padStart(50, '0'))
  //     const nss = `${IdentityURNSpace.decode(identity)}@${clientId}`
  //     const fullAuthzURN = AuthorizationURNSpace.componentizedUrn(nss, {
  //       client_id: clientId,
  //     })
  //     await caller.edges.makeEdge({
  //       src: identity,
  //       dst: fullAuthzURN,
  //       tag: EDGE_AUTHORIZES,
  //     })
  //   }
  // }
}
