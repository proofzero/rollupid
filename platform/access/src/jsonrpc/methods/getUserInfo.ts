import { z } from 'zod'
import { decodeJwt } from 'jose'

import { AccountURNSpace } from '@proofzero/urns/account'
import { AccessJWTPayload } from '@proofzero/types/access'

import { Context } from '../../context'
import IdTokenProfileSchema from '../validators/IdTokenProfileSchema'
import getIdTokenProfileFromAccount from '../../utils/getIdTokenProfileFromAccount'
import { initAccessNodeByName } from '../../nodes'

export const GetUserInfoInput = z.object({
  access_token: z.string(),
})

export const GetUserInfoOutput = IdTokenProfileSchema

export const getUserInfoMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetUserInfoInput>
  ctx: Context
}): Promise<z.infer<typeof GetUserInfoOutput>> => {
  const token = input.access_token
  const jwt = decodeJwt(token) as AccessJWTPayload
  const account = jwt.sub
  const [clientId] = jwt.aud

  if (!clientId) {
    throw new Error('missing client id in the aud claim')
  }

  if (!AccountURNSpace.is(account)) {
    throw new Error(`missing account in the sub claim`)
  }

  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  await accessNode.class.verify(token)
  return getIdTokenProfileFromAccount(account, ctx)
}
