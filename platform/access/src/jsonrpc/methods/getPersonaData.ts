import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { PersonaData } from '@proofzero/types/application'

export const GetPersonaDataInput = z.object({
  accountUrn: z.string(),
  clientId: z.string(),
})

export const GetPersonaDataOutput = PersonaData

export const getPersonaDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetPersonaDataInput>
  ctx: Context
}): Promise<z.infer<typeof GetPersonaDataOutput>> => {
  const { accountUrn, clientId } = input

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

  const personaData =
    (await accessNode.storage.get<PersonaData>('personaData')) || {}
  return personaData
}
