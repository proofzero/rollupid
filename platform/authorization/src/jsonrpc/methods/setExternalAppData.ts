import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import { UsageCategory, generateUsageKey } from '@proofzero/utils/usage'

export const SetExternalAppDataInputSchema = AppClientIdParamSchema.extend({
  payload: z.any(),
})
type SetExternalAppDataInput = z.infer<typeof SetExternalAppDataInputSchema>

export const setExternalAppDataMethod = async ({
  input,
  ctx,
}: {
  input: SetExternalAppDataInput
  ctx: Context
}) => {
  const identityURN = ctx.identityURN as IdentityURN
  const { clientId, payload } = input

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id',
    })

  if (!IdentityURNSpace.is(identityURN))
    throw new BadRequestError({
      message: 'missing identity',
    })

  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const node = initAuthorizationNodeByName(urn, ctx.env.Authorization)

  const externalStorageWriteKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataWrite
  )

  const { value: externalStorageWriteStr, metadata } =
    await ctx.env.UsageKV.getWithMetadata<{
      limit?: number
    }>(externalStorageWriteKey)
  if (!externalStorageWriteStr) {
    throw new BadRequestError({
      message: 'external storage not enabled',
    })
  }
  if (!metadata || !metadata.limit) {
    throw new BadRequestError({
      message: 'missing metadata',
    })
  }

  const externalStorageWritesNum = Number(externalStorageWriteStr)
  if (isNaN(externalStorageWritesNum)) {
    throw new BadRequestError({
      message: 'invalid external storage write count',
    })
  }

  if (externalStorageWritesNum >= metadata.limit) {
    throw new BadRequestError({
      message: 'external storage write limit reached',
    })
  }

  await Promise.all([
    node.storage.put('externalAppData', payload),
    ctx.env.UsageKV.put(
      externalStorageWriteKey,
      `${externalStorageWritesNum + 1}`,
      {
        metadata,
      }
    ),
  ])
}
