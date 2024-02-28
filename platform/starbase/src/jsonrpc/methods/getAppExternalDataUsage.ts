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
    clientID: z.string(),
  })
  .optional()

export const GetAppExternalDataUsageBatchInputSchema = z.array(z.string())
export const GetAppExternalDataUsageBatchOutputSchema = z.array(
  GetAppExternalDataUsageOutputSchema
)

type GetAppExternalDataUsageInput = z.infer<
  typeof GetAppExternalDataUsageInputSchema
>
export type GetAppExternalDataUsageOutput = z.infer<
  typeof GetAppExternalDataUsageOutputSchema
>

type GetAppExternalDataUsageBatchInput = z.infer<
  typeof GetAppExternalDataUsageBatchInputSchema
>
export type GetAppExternalDataUsageBatchOutput = z.infer<
  typeof GetAppExternalDataUsageBatchOutputSchema
>

export const getAppExternalDataUsage = async ({
  input,
  ctx,
}: {
  input: GetAppExternalDataUsageInput
  ctx: Context
}): Promise<GetAppExternalDataUsageOutput> => getUsage(ctx, input.clientId)

export const getAppExternalDataUsageBatch = async ({
  input,
  ctx,
}: {
  input: GetAppExternalDataUsageBatchInput
  ctx: Context
}): Promise<GetAppExternalDataUsageBatchOutput> =>
  Promise.all(input.map((clientId) => getUsage(ctx, clientId)))

const getUsage = async (ctx: Context, clientID: string) => {
  const appDO = await getApplicationNodeByClientId(
    clientID,
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
    clientID,
    UsageCategory.ExternalAppDataRead
  )

  const externalStorageWriteKey = generateUsageKey(
    clientID,
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
    clientID,
  }
}
