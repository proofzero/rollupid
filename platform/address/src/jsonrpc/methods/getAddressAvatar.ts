import { z } from 'zod'

import { OAuthAddressType } from '@proofzero/types/address'

import type { Context } from '../../context'
import { MicrosoftAddress } from '../../nodes'

export const GetAddressAvatarOutput = z.string()

type GetAddressAvatarResult = z.infer<typeof GetAddressAvatarOutput>

type GetAddressAvatarParams = {
  ctx: Context
}

interface GetAddressAvatarMethod {
  (params: GetAddressAvatarParams): Promise<GetAddressAvatarResult>
}

export const getAddressAvatarMethod: GetAddressAvatarMethod = async ({
  ctx,
}) => {
  const nodeClient = ctx.address
  if (!nodeClient) throw new Error('missing nodeClient')

  const address = await nodeClient.class.getAddress()
  const type = await nodeClient.class.getType()

  if (!address || !type) {
    throw new Error('missing address or type')
  }

  if (type == OAuthAddressType.Microsoft) {
    const oAuthNode = new MicrosoftAddress(nodeClient, ctx)
    return oAuthNode.getAvatar()
  }

  throw new Error('Unsupported address type')
}
