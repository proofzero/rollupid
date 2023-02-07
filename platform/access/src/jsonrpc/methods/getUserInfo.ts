import { z } from 'zod'
import { Context } from '../../context'
import { AccountURN } from '@kubelt/urns/account'
import { decodeJwt } from 'jose'
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
  const tokenJson = decodeJwt(token)

  if (!tokenJson || !tokenJson.sub || !tokenJson.iss)
    throw new Error(`getUserInfo: Invalid token provided`)
  const accessNode = await initAccessNodeByName(tokenJson.iss, ctx.Access)

  await accessNode.class.verify(token)

  const account = tokenJson.sub as AccountURN
  return getIdTokenProfileFromAccount(account, ctx)
}
