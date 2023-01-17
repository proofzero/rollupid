import { Context } from '../../context'
import { OAuthData } from '../../types'
import { OAuthDataSchema } from '../validators/oauth'
import { z } from 'zod'
import { OAuthNode } from '../../nodes'

export const GetOAuthDataOutput = OAuthDataSchema

export const getOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<z.infer<typeof GetOAuthDataOutput>> => {
  const nodeClient = ctx.address as OAuthNode
  const data = (await nodeClient?.oauth.class.getData()) as OAuthData
  return data
}
