import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import { UsageCategory, generateUsageKey } from '@proofzero/utils/usage'

export const GetExternalAppDataInputSchema = AppClientIdParamSchema
type GetExternalAppDataInput = z.infer<typeof GetExternalAppDataInputSchema>

export const GetExternalAppDataOutputSchema = z.any()
type GetExternalAppDataOutput = z.infer<typeof GetExternalAppDataOutputSchema>

export const getExternalAppDataMethod = async ({
  input,
  ctx,
}: {
  input: GetExternalAppDataInput
  ctx: Context
}): Promise<GetExternalAppDataOutput> => {
  const identityURN = ctx.identityURN as IdentityURN
  const { clientId } = input

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

  const externalStorageReadKey = generateUsageKey(
    clientId,
    UsageCategory.ExternalAppDataRead
  )

  const { value: externalStorageReadStr, metadata } =
    await ctx.env.UsageKV.getWithMetadata<{
      limit?: number
    }>(externalStorageReadKey)
  if (!externalStorageReadStr) {
    throw new BadRequestError({
      message: 'external storage not enabled',
    })
  }
  if (!metadata || !metadata.limit) {
    throw new BadRequestError({
      message: 'missing metadata',
    })
  }

  const externalStorageReadsNum = Number(parseInt(externalStorageReadStr))
  if (isNaN(externalStorageReadsNum)) {
    throw new BadRequestError({
      message: 'invalid external storage read count',
    })
  }

  if (externalStorageReadsNum >= metadata.limit) {
    throw new BadRequestError({
      message: 'external storage read limit reached',
    })
  }

  const [externalAppData] = await Promise.all([
    node.storage.get('externalAppData'),
    ctx.env.UsageKV.put(
      externalStorageReadKey,
      `${externalStorageReadsNum + 1}`,
      {
        metadata,
      }
    ),
  ])

  return externalAppData
}
