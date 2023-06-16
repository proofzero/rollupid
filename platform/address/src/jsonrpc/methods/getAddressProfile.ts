import { z } from 'zod'

import { BadRequestError, InternalServerError } from '@proofzero/errors'

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
  initAddressNodeByName,
} from '../../nodes'

import { AddressProfileSchema } from '../validators/profile'
import OAuthAddress from '../../nodes/oauth'
import Address from '../../nodes/address'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

export const GetAddressProfileOutput = AddressProfileSchema.extend({
  id: AddressURNInput,
})

export const GetAddressProfileBatchInput = z.array(AddressURNInput)
export const GetAddressProfileBatchOutput = z.array(GetAddressProfileOutput)

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
  if (!nodeClient)
    throw new InternalServerError({ message: 'missing nodeClient' })

  return await getProfile(ctx, nodeClient, ctx.addressURN!)
}

export const getAddressProfileBatchMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAddressProfileBatchInput>
  ctx: Context
}) => {
  //In case of batch lookups, we don't care about the address in the context,
  //and setup address DOs ourselves for each addressURN in the input array
  const resultPromises = []
  for (const addressURN of input) {
    const baseURN = AddressURNSpace.getBaseURN(addressURN)
    const nodeClient = initAddressNodeByName(baseURN, ctx.Address)
    resultPromises.push(getProfile(ctx, nodeClient, addressURN))
  }
  return await Promise.all(resultPromises)
}

async function getProfile(
  ctx: Context,
  nodeClient: ReturnType<typeof initAddressNodeByName>,
  addressURN: AddressURN
) {
  const address = await nodeClient?.class.getAddress()
  const type = await nodeClient?.class.getType()
  if (!address || !type) {
    throw new InternalServerError({ message: 'missing address or type' })
  }

  if (!ctx.addressURN)
    throw new BadRequestError({ message: 'missing addressURN' })

  const getProfileNode = ():
    | ContractAddress
    | CryptoAddress
    | EmailAddress
    | OAuthAddress
    | undefined => {
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
    throw new InternalServerError({
      message: 'unsupported address type',
      cause: { type },
    })
  }

  const profile = await node.getProfile()

  return {
    id: addressURN,
    ...profile,
  }
}
