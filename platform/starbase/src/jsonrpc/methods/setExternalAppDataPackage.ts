import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { EDGE_APPLICATION } from '../../types'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'
import ExternalAppDataPackages from '../../utils/externalAppDataPackages'
import { generateUsageKey } from '@proofzero/utils/usage'

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

  const externalStorageUsageWriteKey = generateUsageKey(
    clientId,
    'external-storage',
    'write'
  )
  const externalStorageUsageReadKey = generateUsageKey(
    clientId,
    'external-storage',
    'read'
  )

  const externalStorageWrites = await ctx.env.UsageKV.get<number>(
    externalStorageUsageWriteKey
  )
  const externalStorageReads = await ctx.env.UsageKV.get<number>(
    externalStorageUsageReadKey
  )

  const packageDetails = packageType
    ? {
        packageType,
        ...ExternalAppDataPackages[packageType],
      }
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
      await ctx.env.UsageKV.put(externalStorageUsageWriteKey, '0')
    }
    if (!externalStorageReads) {
      await ctx.env.UsageKV.put(externalStorageUsageReadKey, '0')
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

    await ctx.env.UsageKV.delete(externalStorageUsageWriteKey)
    await ctx.env.UsageKV.delete(externalStorageUsageReadKey)
  }

  await appDO.class.setExternalAppDataPackage(packageDetails)
}
