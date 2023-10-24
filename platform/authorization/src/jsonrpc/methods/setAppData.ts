import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import { AppData } from '@proofzero/types/application'
import type { AppDataType } from '@proofzero/types/application'
import type { IdentityURN } from '@proofzero/urns/identity'

export const SetAppDataInput = z.object({
  clientId: z.string(),
  appData: AppData,
})

export const setAppDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetAppDataInput>
  ctx: Context
}) => {
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
  await node.storage.put<AppDataType>({ appData: input.appData })
}
