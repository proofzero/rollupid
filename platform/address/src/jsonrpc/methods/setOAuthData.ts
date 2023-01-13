import { z } from 'zod'
import { Context } from '../../context'
import { OAuthDataSchema } from '../validators/oauth'
import { OAuthAddressType } from '@kubelt/types/address'
import { AddressNode } from '../../nodes'
import OAuthAddress from '../../nodes/oauth'

export const SetOAuthDataInput = OAuthDataSchema

export const setOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof OAuthDataSchema>
  ctx: Context
}): Promise<void> => {
  const nodeClient = new OAuthAddress(ctx.address as AddressNode)
  await nodeClient.setData(input)

  switch (input.profile.provider) {
    case OAuthAddressType.Google:
    case OAuthAddressType.GitHub:
    case OAuthAddressType.Microsoft:
      return ctx.address?.class.setProfile(input.profile._json)
    case OAuthAddressType.Twitter:
      return ctx.address?.class.setProfile(input.profile)
    default:
      throw new Error('Unsupported OAuth provider response provided.')
  }
}
