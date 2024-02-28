import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import { UsageCategory, generateUsageKey } from '@proofzero/utils/usage'
import { usageGate } from './setExternalAppData'

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

  await usageGate(ctx, identityURN, clientId, externalStorageReadKey)

  return node.storage.get('externalAppData')
}
