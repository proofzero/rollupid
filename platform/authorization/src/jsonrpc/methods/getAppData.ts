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

export const GetAppDataInput = z.object({
  clientId: z.string(),
})

export const GetAppDataOutput = AppData

export const getAppDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppDataInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppDataOutput>> => {
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
  const node = initAuthorizationNodeByName(urn, ctx.Authorization)

  const appData =
    (await node.storage.get<AppDataType>('appData')) || ({} as AppDataType)

  //Remove legacy, non-account urns from result
  if (appData && Array.isArray(appData.smartWalletSessionKeys))
    appData.smartWalletSessionKeys = appData.smartWalletSessionKeys.filter(
      (scwk) => AccountURNSpace.is(scwk.urn)
    )
  return appData
}
