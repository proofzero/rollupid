import { z } from 'zod'

import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'

import {
  AppleAddress,
  CryptoAddress,
  DiscordAddress,
  EmailAddress,
  GithubAddress,
  GoogleAddress,
  MicrosoftAddress,
  TwitterAddress,
  ContractAddress,
} from '../../nodes'

import { AddressProfileSchema } from '../validators/profile'

export const GetAddressProfileOutput = AddressProfileSchema.extend({
  id: AddressURNInput,
})

type GetAddressProfileParams = {
  ctx: Context
}

export type GetAddressProfileResult = z.infer<typeof GetAddressProfileOutput>

interface GetAddressProfileMethod {
  (params: GetAddressProfileParams): Promise<GetAddressProfileResult>
}

export const getAddressProfileMethod: GetAddressProfileMethod = async ({
  ctx,
}) => {
  const nodeClient = ctx.address
  if (!nodeClient) throw new Error('missing nodeClient')

  const address = await nodeClient?.class.getAddress()
  const type = await nodeClient?.class.getType()

  if (!address || !type) {
    throw new Error('missing address or type')
  }

  if (!ctx.addressURN) throw new Error('missing addressURN')

  const getProfileNode = () => {
    switch (type) {
      case CryptoAddressType.ETH:
        return new CryptoAddress(nodeClient)
      case CryptoAddressType.Wallet:
        return new ContractAddress(nodeClient)
      case EmailAddressType.Email:
        return new EmailAddress(nodeClient, ctx)
      case OAuthAddressType.Apple:
        return new AppleAddress(nodeClient, ctx)
      case OAuthAddressType.Discord:
        return new DiscordAddress(nodeClient, ctx)
      case OAuthAddressType.GitHub:
        return new GithubAddress(nodeClient)
      case OAuthAddressType.Google:
        return new GoogleAddress(nodeClient, ctx)
      case OAuthAddressType.Microsoft:
        return new MicrosoftAddress(nodeClient, ctx)
      case OAuthAddressType.Twitter:
        return new TwitterAddress(nodeClient)
    }
  }

  const node = getProfileNode()
  if (!node) {
    throw new Error('unsupported address type')
  }

  const profile = await node.getProfile()

  return {
    id: ctx.addressURN,
    ...profile,
  }
}
