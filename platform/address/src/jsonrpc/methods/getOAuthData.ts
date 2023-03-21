import { Context } from '../../context'
import { OAuthData } from '../../types'
import { OAuthDataSchema } from '../validators/oauth'
import { z } from 'zod'
import { AddressNode } from '../../nodes'
import OAuthAddress from '../../nodes/oauth'

export const GetOAuthDataOutput = OAuthDataSchema.optional()

export const getOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<z.infer<typeof GetOAuthDataOutput>> => {
  const nodeClient = new OAuthAddress(ctx.address as AddressNode)
  const data = (await nodeClient.getData()) as OAuthData
  if (
    data?.profile.provider === 'apple' &&
    typeof data?.profile.name === 'object'
  ) {
    const newData = {
      ...data,
      profile: {
        ...data.profile,
        name: Object.values(data.profile.name).join(' '),
      },
    }
    await nodeClient.setData(newData)
    return newData
  }
  return data
}
