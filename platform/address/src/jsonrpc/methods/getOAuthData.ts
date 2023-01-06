import { z } from 'zod'
import { Context } from '../../context'
import { OAuthAddressProxyStub } from '../../nodes/oauth'
import { OAuthDataSchema } from '../../types'
import { GetGoogleOAuthDataSchema } from '../validators/oauth'

export const GetOAuthDataOutput = GetGoogleOAuthDataSchema // TODO: add other schemas with z.union

export const getOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: void
  ctx: Context
}): Promise<OAuthDataSchema | undefined> => {
  const nodeClient = ctx.address as OAuthAddressProxyStub
  const data = await nodeClient?.class.getData()
  return data
}
