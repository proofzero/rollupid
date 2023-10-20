import { z } from 'zod'

import { BadRequestError, InternalServerError } from '@proofzero/errors'

import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import type { Context } from '../../context'

import {
  AppleAccount,
  CryptoAccount,
  DiscordAccount,
  EmailAccount,
  GithubAccount,
  GoogleAccount,
  MicrosoftAccount,
  TwitterAccount,
  ContractAccount,
  initAccountNodeByName,
  WebauthnAccount,
} from '../../nodes'

import { AccountProfileSchema } from '../validators/profile'
import OAuthAccount from '../../nodes/oauth'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

export const GetAccountProfileOutput = AccountProfileSchema.extend({
  id: AccountURNInput,
})

export const GetAccountProfileBatchInput = z.array(AccountURNInput)
export const GetAccountProfileBatchOutput = z.array(GetAccountProfileOutput)

type GetAccountProfileParams = {
  ctx: Context
}

export type GetAccountProfileResult = z.infer<typeof GetAccountProfileOutput>

interface GetAccountProfileMethod {
  (params: GetAccountProfileParams): Promise<GetAccountProfileResult>
}

export const getAccountProfileMethod: GetAccountProfileMethod = async ({
  ctx,
}) => {
  const nodeClient = ctx.account
  if (!nodeClient)
    throw new InternalServerError({ message: 'missing nodeClient' })

  return await getProfile(ctx, nodeClient, ctx.accountURN!)
}

export const getAccountProfileBatchMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAccountProfileBatchInput>
  ctx: Context
}) => {
  //In case of batch lookups, we don't care about the account in the
  //context, and setup account DOs ourselves for each accountURN in
  //the input array
  const resultPromises = []
  for (const accountURN of input) {
    const baseURN = AccountURNSpace.getBaseURN(accountURN)
    const nodeClient = initAccountNodeByName(baseURN, ctx.env.Account)
    resultPromises.push(getProfile(ctx, nodeClient, accountURN))
  }
  return await Promise.all(resultPromises)
}

async function getProfile(
  ctx: Context,
  nodeClient: ReturnType<typeof initAccountNodeByName>,
  accountURN: AccountURN
) {
  const address = await nodeClient?.class.getAddress()
  const type = await nodeClient?.class.getType()
  if (!address || !type) {
    throw new InternalServerError({ message: 'missing address or type' })
  }

  if (!accountURN) throw new BadRequestError({ message: 'missing accountURN' })

  const getProfileNode = ():
    | ContractAccount
    | CryptoAccount
    | EmailAccount
    | WebauthnAccount
    | OAuthAccount
    | undefined => {
    switch (type) {
      case CryptoAccountType.ETH:
        return new CryptoAccount(nodeClient)
      case CryptoAccountType.Wallet:
        return new ContractAccount(nodeClient)
      case EmailAccountType.Email:
        return new EmailAccount(nodeClient, ctx.env)
      case WebauthnAccountType.WebAuthN:
        return new WebauthnAccount(nodeClient)
      case OAuthAccountType.Apple:
        return new AppleAccount(nodeClient, ctx.env)
      case OAuthAccountType.Discord:
        return new DiscordAccount(nodeClient, ctx.env)
      case OAuthAccountType.GitHub:
        return new GithubAccount(nodeClient)
      case OAuthAccountType.Google:
        return new GoogleAccount(nodeClient, ctx.env)
      case OAuthAccountType.Microsoft:
        return new MicrosoftAccount(nodeClient, ctx.hashedIdref!, ctx.env)
      case OAuthAccountType.Twitter:
        return new TwitterAccount(nodeClient)
    }
  }

  const node = getProfileNode()
  if (!node) {
    throw new InternalServerError({
      message: 'unsupported account type',
      cause: { type },
    })
  }

  const profile = await node.getProfile()

  return {
    id: accountURN,
    ...profile,
  }
}
