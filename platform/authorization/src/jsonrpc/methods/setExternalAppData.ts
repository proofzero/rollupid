import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import { generateUsageKey } from '@proofzero/utils/usage'

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

  const externalStorageWrites = await ctx.env.UsageKV.get<string>(
    generateUsageKey(clientId, 'external-storage', 'write')
  )
  if (!externalStorageWrites) {
    throw new BadRequestError({
      message: 'external storage not enabled',
    })
  }

  const externalStorageWritesNum = parseInt(externalStorageWrites)

  await Promise.all([
    node.storage.put('externalAppData', payload),
    ctx.env.UsageKV.put(
      generateUsageKey(clientId, 'external-storage', 'write'),
      `${externalStorageWritesNum + 1}`
    ),
  ])
}
