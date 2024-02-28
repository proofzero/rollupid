import { z } from 'zod'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { Context } from '@proofzero/platform.authorization/src/context'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import {
  UsageCategory,
  generateUsageKey,
  getStoredUsageWithMetadata,
} from '@proofzero/utils/usage'
import { getApplicationNodeByClientId } from '../../nodes/application'

export const ExternalAppDataUsageResetInputSchema = AppClientIdParamSchema
type ExternalAppDataUsageResetInput = z.infer<
  typeof ExternalAppDataUsageResetInputSchema
>

export const externalAppDataUsageResetMethod = async ({
  input,
  ctx,
}: {
  input: ExternalAppDataUsageResetInput
  ctx: Context
}) => {
  const { clientId } = input

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id',
    })

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
  if (!externalAppDataPackageDefinition) {
    throw new InternalServerError({
      message: 'external app data package not found',
    })
  }

  const { packageDetails } = externalAppDataPackageDefinition

  const externalStorageWriteKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataWrite
  )

  const externalStorageReadKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataRead
  )

  const {
    numValue: externalStorageWriteVal,
    metadata: externalStorageWriteMetadata,
  } = await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageWriteKey)
  const writeOutstandingLimit =
    externalStorageWriteMetadata.limit > packageDetails.writes
      ? externalStorageWriteMetadata.limit -
        Math.max(externalStorageWriteVal, packageDetails.writes)
      : 0
  externalStorageWriteMetadata.limit =
    packageDetails.writes + Math.max(writeOutstandingLimit, 0)

  const {
    numValue: externalStorageReadVal,
    metadata: externalStorageReadMetadata,
  } = await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageReadKey)
  const readOutstandingLimit =
    externalStorageReadMetadata.limit > packageDetails.reads
      ? externalStorageReadMetadata.limit -
        Math.max(externalStorageReadVal, packageDetails.reads)
      : 0
  externalStorageReadMetadata.limit =
    packageDetails.reads + Math.max(readOutstandingLimit, 0)

  await Promise.all([
    ctx.env.UsageKV.put(externalStorageWriteKey, `${0}`, {
      metadata: externalStorageWriteMetadata,
    }),
    ctx.env.UsageKV.put(externalStorageReadKey, `${0}`, {
      metadata: externalStorageReadMetadata,
    }),
  ])
}
