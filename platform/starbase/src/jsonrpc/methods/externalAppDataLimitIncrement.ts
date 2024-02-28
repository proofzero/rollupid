import { z } from 'zod'
import { BadRequestError } from '@proofzero/errors'
import { Context } from '@proofzero/platform.authorization/src/context'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import {
  UsageCategory,
  generateUsageKey,
  getStoredUsageWithMetadata,
} from '@proofzero/utils/usage'

export const ExternalAppDataLimitIncrementInputSchema =
  AppClientIdParamSchema.extend({
    reads: z.number(),
    writes: z.number(),
  })
type ExternalAppDataLimitIncrementInput = z.infer<
  typeof ExternalAppDataLimitIncrementInputSchema
>

export const externalAppDataLimitIncrementMethod = async ({
  input,
  ctx,
}: {
  input: ExternalAppDataLimitIncrementInput
  ctx: Context
}) => {
  const { clientId, reads, writes } = input

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id',
    })

  const externalStorageWriteKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataWrite
  )

  const externalStorageReadKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataRead
  )

  const {
    numValue: externalStorageWriteNumVal,
    metadata: externalStorageWriteMetadata,
  } = await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageWriteKey)
  externalStorageWriteMetadata.limit += writes

  const {
    numValue: externalStorageReadNumVal,
    metadata: externalStorageReadMetadata,
  } = await getStoredUsageWithMetadata(ctx.env.UsageKV, externalStorageReadKey)
  externalStorageReadMetadata.limit += reads

  await Promise.all([
    ctx.env.UsageKV.put(
      externalStorageWriteKey,
      `${externalStorageWriteNumVal}`,
      {
        metadata: externalStorageWriteMetadata,
      }
    ),
    ctx.env.UsageKV.put(
      externalStorageReadKey,
      `${externalStorageReadNumVal}`,
      {
        metadata: externalStorageReadMetadata,
      }
    ),
  ])
}
