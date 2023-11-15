import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import { AppData } from '@proofzero/types/application'
import type { AppDataType } from '@proofzero/types/application'
import type { IdentityURN } from '@proofzero/urns/identity'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AppClientIdParamSchema } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'

export const GetExternalDataInputSchema = AppClientIdParamSchema
type GetExternalDataInput = z.infer<typeof GetExternalDataInputSchema>

export const GetExternalDataOutputSchema = z.any()
type GetExternalDataOutput = z.infer<typeof GetExternalDataOutputSchema>

export const getExternalDataMethod = async ({
  input,
  ctx,
}: {
  input: GetExternalDataInput
  ctx: Context
}): Promise<GetExternalDataOutput> => {
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

  return node.storage.get('externalData')
}
