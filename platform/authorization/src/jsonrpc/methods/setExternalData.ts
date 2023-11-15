import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'

export const SetExternalDataInputSchema = AppClientIdParamSchema.extend({
  payload: z.any(),
})
type SetExternalDataInput = z.infer<typeof SetExternalDataInputSchema>

export const setExternalDataMethod = async ({
  input,
  ctx,
}: {
  input: SetExternalDataInput
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

  // TODO: Check if service is enabled
  // TODO: Error handling
  let externalStorageWrites =
    (await ctx.env.UsageKV.get<number>(`${clientId}:external-storage:write`)) ??
    0

  await node.storage.put('externalData', payload)

  await ctx.env.UsageKV.put(
    `${clientId}:external-storage:write`,
    `${++externalStorageWrites}`
  )
}
