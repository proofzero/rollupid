import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import { generateUsageKey } from '@proofzero/utils/usage'

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

  const externalStorageReads = await ctx.env.UsageKV.get<string>(
    generateUsageKey(clientId, 'external-storage', 'read')
  )
  if (!externalStorageReads) {
    throw new BadRequestError({
      message: 'external storage not enabled',
    })
  }

  const externalStorageReadsNum = parseInt(externalStorageReads)

  const [externalAppData] = await Promise.all([
    node.storage.get('externalAppData'),
    ctx.env.UsageKV.put(
      generateUsageKey(clientId, 'external-storage', 'read'),
      `${externalStorageReadsNum + 1}`
    ),
  ])

  return externalAppData
}
