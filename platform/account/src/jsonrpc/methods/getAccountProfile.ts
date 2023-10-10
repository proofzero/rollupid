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
  AccountNode,
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

import {
  AccountProfileSchema,
  MaskAccountProfileSchema,
} from '../validators/profile'
import OAuthAccount from '../../nodes/oauth'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

export const GetAccountProfileOutput = z.union([
  MaskAccountProfileSchema.extend({
    id: AccountURNInput,
  }),
  AccountProfileSchema.extend({
    id: AccountURNInput,
  }),
])

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
    const nodeClient = initAccountNodeByName(baseURN, ctx.Account)
    resultPromises.push(getProfile(ctx, nodeClient, accountURN))
  }
  return Promise.all(resultPromises)
}

async function getProfile(
  ctx: Context,
  node: AccountNode,
  accountURN: AccountURN
) {
  const address = await node.class.getAddress()
  const type = await node.class.getType()
  if (!address || !type) {
    throw new InternalServerError({ message: 'missing address or type' })
  }

  if (!accountURN) throw new BadRequestError({ message: 'missing accountURN' })

  const getAccount = (node: AccountNode) => {
    switch (type) {
      case CryptoAccountType.ETH:
        return new CryptoAccount(node)
      case CryptoAccountType.Wallet:
        return new ContractAccount(node)
      case EmailAccountType.Mask:
      case EmailAccountType.Email:
        return new EmailAccount(node, ctx.env)
      case WebauthnAccountType.WebAuthN:
        return new WebauthnAccount(node, ctx)
      case OAuthAccountType.Apple:
        return new AppleAccount(node, ctx)
      case OAuthAccountType.Discord:
        return new DiscordAccount(node, ctx)
      case OAuthAccountType.GitHub:
        return new GithubAccount(node)
      case OAuthAccountType.Google:
        return new GoogleAccount(node, ctx)
      case OAuthAccountType.Microsoft:
        return new MicrosoftAccount(node, ctx)
      case OAuthAccountType.Twitter:
        return new TwitterAccount(node)
    }
  }

  const account = getAccount(node)
  if (!account) {
    throw new InternalServerError({
      message: 'unsupported account type',
      cause: { type },
    })
  }

  const id = accountURN

  const profile = await account.getProfile()

  if (account instanceof EmailAccount && type === EmailAccountType.Mask) {
    const sourceAccountURN = await account.getSourceAccount()
    if (sourceAccountURN) {
      const sourceAccount = getAccount(
        initAccountNodeByName(sourceAccountURN, ctx.Account)
      )
      if (sourceAccount) {
        const source = await sourceAccount.getProfile()
        return {
          ...profile,
          id,
          source,
        }
      }
    }
  }

  return {
    ...profile,
    id,
  }
}
