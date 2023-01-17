import { z } from 'zod'
import { Context } from '../../context'
import { OAuthDataSchema } from '../validators/oauth'
import { OAuthAddressType } from '@kubelt/types/address'
import { OAuthNode } from '../../nodes'

export const SetOAuthDataInput = OAuthDataSchema

export const setOAuthDataMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof OAuthDataSchema>
  ctx: Context
}): Promise<void> => {
  const nodeClient = ctx.address as OAuthNode
  await nodeClient.oauth.class.setData(input)

  switch (input.profile.provider) {
    case OAuthAddressType.Google:
    case OAuthAddressType.GitHub:
      return nodeClient.class.setProfile(input.profile._json)
    case OAuthAddressType.Twitter:
      return nodeClient.class.setProfile(input.profile) // TODO: make consistent with other providers?
  }

  throw new Error('Unsupported OAuth provider response provided.')
}
