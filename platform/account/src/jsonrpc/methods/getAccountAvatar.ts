import { z } from 'zod'

import { OAuthAccountType } from '@proofzero/types/account'

import type { Context } from '../../context'
import { MicrosoftAccount } from '../../nodes'

export const GetAccountAvatarOutput = z.string()

type GetAccountAvatarResult = z.infer<typeof GetAccountAvatarOutput>

type GetAccountAvatarParams = {
  ctx: Context
}

interface GetAccountAvatarMethod {
  (params: GetAccountAvatarParams): Promise<GetAccountAvatarResult>
}

export const getAccountAvatarMethod: GetAccountAvatarMethod = async ({
  ctx,
}) => {
  const nodeClient = ctx.account
  if (!nodeClient) throw new Error('missing nodeClient')

  const address = await nodeClient.class.getAddress()
  const type = await nodeClient.class.getType()

  if (!address || !type) {
    throw new Error('missing address or type')
  }

  if (type == OAuthAccountType.Microsoft) {
    const oAuthNode = new MicrosoftAccount(
      nodeClient,
      ctx.hashedIdref!,
      ctx.env
    )
    return oAuthNode.getAvatar()
  }

  throw new Error('Unsupported account type')
}
