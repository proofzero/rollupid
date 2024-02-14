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

export const GetAppExternalDataUsageInputSchema = AppClientIdParamSchema
export const GetAppExternalDataUsageOutputSchema = z
  .object({
    packageType: z.nativeEnum(ExternalAppDataPackageType),
    reads: z.number(),
    writes: z.number(),
    readUsage: z.number(),
    writeUsage: z.number(),
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
  if (!externalAppDataPackageDefinition) {
    return externalAppDataPackageDefinition
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
    reads: readMeta.limit,
    readUsage: readNumVal,
    writes: writeMeta.limit,
    writeUsage: writeNumVal,
  }
}
