import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AppData } from '@proofzero/types/application'
import type { AppDataType } from '@proofzero/types/application'
import type { AccountURN } from '@proofzero/urns/account'

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
  const accountUrn = ctx.accountURN as AccountURN
  const { clientId } = input

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id',
    })

  if (!AccountURNSpace.is(accountUrn))
    throw new BadRequestError({
      message: 'missing account',
    })

  const name = `${AccountURNSpace.decode(accountUrn)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  await accessNode.storage.put<AppDataType>({ appData: input.appData })
}
