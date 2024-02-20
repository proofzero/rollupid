import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import {
  UsageCategory,
  generateUsageKey,
  getStoredUsageWithMetadata,
} from '@proofzero/utils/usage'
import { ExternalAppDataPackageStatus } from '../validators/externalAppDataPackageDefinition'

export const GetAppExternalDataUsageInputSchema = AppClientIdParamSchema
export const GetAppExternalDataUsageOutputSchema = z
  .object({
    packageType: z.nativeEnum(ExternalAppDataPackageType),
    readAvailable: z.number(),
    readUsage: z.number(),
    readTopUp: z.number(),
    writeAvailable: z.number(),
    writeUsage: z.number(),
    writeTopUp: z.number(),
  })
  .optional()

type GetAppExternalDataUsageInput = z.infer<
  typeof GetAppExternalDataUsageInputSchema
>
export type GetAppExternalDataUsageOutput = z.infer<
  typeof GetAppExternalDataUsageOutputSchema
>

export const getAppExternalDataUsage = async ({
  input,
  ctx,
}: {
  input: GetAppExternalDataUsageInput
  ctx: Context
}): Promise<GetAppExternalDataUsageOutput> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
  if (
    !externalAppDataPackageDefinition ||
    externalAppDataPackageDefinition.status !==
      ExternalAppDataPackageStatus.Enabled
  ) {
    return undefined
  }

  const { packageDetails } = externalAppDataPackageDefinition

  const externalStorageReadKey = generateUsageKey(
    input.clientId,
    UsageCategory.ExternalAppDataRead
  )

  const externalStorageWriteKey = generateUsageKey(
    input.clientId,
    UsageCategory.ExternalAppDataWrite
  )

  const { numValue: readNumVal, metadata: readMeta } =
    await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageReadKey)

  const { numValue: writeNumVal, metadata: writeMeta } =
    await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageWriteKey)

  return {
    packageType: packageDetails.packageType,
    readAvailable: readMeta.limit,
    readUsage: readNumVal,
    readTopUp:
      readMeta.limit - externalAppDataPackageDefinition.packageDetails.reads,
    writeAvailable: writeMeta.limit,
    writeUsage: writeNumVal,
    writeTopUp:
      writeMeta.limit - externalAppDataPackageDefinition.packageDetails.writes,
  }
}
