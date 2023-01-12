import { Context } from '../../context'
import { OAuthAddressProxyStub } from '../../nodes/oauth'
import { OAuthData } from '../../types'
import { OAuthDataSchema } from '../validators/oauth'
import { z } from 'zod'

export const GetOAuthDataOutput = OAuthDataSchema

export const getOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<z.infer<typeof GetOAuthDataOutput>> => {
  const nodeClient = ctx.address as OAuthAddressProxyStub
  const data = (await nodeClient?.class.getData()) as OAuthData
  return data
}
