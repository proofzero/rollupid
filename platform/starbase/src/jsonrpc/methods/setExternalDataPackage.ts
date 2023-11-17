import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ExternalDataPackageType } from '@proofzero/types/billing'
import { EDGE_APPLICATION } from '../../types'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'
import ExternalDataPackages from '../../utils/externalDataPackages'

export const SetExternalDataPackageInputSchema = AppClientIdParamSchema.extend({
  packageType: z.nativeEnum(ExternalDataPackageType).optional(),
})
type SetExternalDataPackageInput = z.infer<
  typeof SetExternalDataPackageInputSchema
>

export const setExternalDataPackage = async ({
  input,
  ctx,
}: {
  input: SetExternalDataPackageInput
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

  const externalStorageWrites = await ctx.env.UsageKV.get<number>(
    `${clientId}:external-storage:write`
  )
  const externalStorageReads = await ctx.env.UsageKV.get<number>(
    `${clientId}:external-storage:read`
  )

  const packageDetails = packageType
    ? ExternalDataPackages[packageType]
    : undefined

  if (packageDetails) {
    if (externalStorageWrites && externalStorageReads) {
      throw new BadRequestError({
        message: 'external storage already enabled',
      })
    } else if (!externalStorageWrites || !externalStorageReads) {
      console.warn(
        `external storage reads or writes for ${clientId} in a bad state; ${externalStorageWrites} writes and ${externalStorageReads} reads.`
      )
    }

    if (!externalStorageWrites) {
      await ctx.env.UsageKV.put(`${clientId}:external-storage:write`, '0')
    }
    if (!externalStorageReads) {
      await ctx.env.UsageKV.put(`${clientId}:external-storage:read`, '0')
    }
  } else {
    if (!externalStorageWrites && !externalStorageReads) {
      throw new BadRequestError({
        message: 'external storage already disabled',
      })
    } else if (externalStorageWrites || externalStorageReads) {
      console.warn(
        `external storage reads or writes for ${clientId} in a bad state; ${externalStorageWrites} writes and ${externalStorageReads} reads.`
      )
    }

    await ctx.env.UsageKV.delete(`${clientId}:external-storage:write`)
    await ctx.env.UsageKV.delete(`${clientId}:external-storage:read`)
  }

  await appDO.class.setExternalDataPackage(packageDetails)
}
