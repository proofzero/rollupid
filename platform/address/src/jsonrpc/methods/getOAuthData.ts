import { Context } from '../../context'
import { OAuthAddressProxyStub } from '../../nodes/oauth'
import { OAuthDataSchema } from '../../types'
import { GetGoogleOAuthDataSchema } from '../validators/oauth'

export const GetOAuthDataOutput = GetGoogleOAuthDataSchema // TODO: add other schemas with z.union

export const getOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<OAuthDataSchema> => {
  const nodeClient = ctx.address as OAuthAddressProxyStub
  const data = (await nodeClient?.class.getData()) as OAuthDataSchema
  return data
}
