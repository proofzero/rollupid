import { z } from 'zod'
import { Context } from '../../context'
import { OAuthAddressProxyStub } from '../../nodes/oauth'
import { OAuthDataSchema, OAuthGoogleData } from '../../types'
import { GetGoogleOAuthDataSchema } from '../validators/oauth'

export const GetOAuthDataInput = GetGoogleOAuthDataSchema // TODO: add other schemas with z.union

export const setOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: OAuthDataSchema
  ctx: Context
}): Promise<void> => {
  const nodeClient = ctx.address as OAuthAddressProxyStub
  await nodeClient.class.setData(input)

  // next we want to set the oauth account address
  // right now it's only google but we would need to do checks when more are added
  nodeClient.class.setProfile(input.profile._json)

  return
}
