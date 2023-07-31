import { z } from 'zod'
import { Context } from '../../../context'
import { InternalServerError } from '@proofzero/errors'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { router } from '@proofzero/platform.core'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import generateRandomString from '@proofzero/utils/generateRandomString'
import { IdentityURN } from '@proofzero/urns/identity'

export const InviteIdentityGroupMemberInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  identifier: z.string(),
  accountType: z.union([
    z.nativeEnum(EmailAccountType),
    z.nativeEnum(OAuthAccountType),
    z.nativeEnum(CryptoAccountType),
  ]),
})

type InviteIdentityGroupMemberInput = z.infer<
  typeof InviteIdentityGroupMemberInputSchema
>

export const InviteIdentityGroupMemberOutputSchema = z.object({
  inviteCode: z.string(),
})

type InviteIdentityGroupMemberOutput = z.infer<
  typeof InviteIdentityGroupMemberOutputSchema
>

export const inviteIdentityGroupMember = async ({
  input,
  ctx,
}: {
  input: InviteIdentityGroupMemberInput
  ctx: Context
}): Promise<InviteIdentityGroupMemberOutput> => {
  const { identityGroupURN, identifier, accountType } = input
  const inviterIdentityURN = ctx.identityURN as IdentityURN

  const node = await initIdentityGroupNodeByName(
    identityGroupURN,
    ctx.IdentityGroup
  )
  if (!node) {
    throw new InternalServerError({
      message: 'Identity group DO not found',
    })
  }

  const inviteCode = generateRandomString(
    IDENTITY_GROUP_OPTIONS.inviteCodeLength
  )

  const caller = router.createCaller(ctx)
  const inviterProfile = await caller.identity.getProfile({
    identity: inviterIdentityURN,
  })
  if (!inviterProfile) {
    throw new InternalServerError({
      message: 'Inviter profile not found',
    })
  }

  const primaryAccountURN = AccountURNSpace.componentizedParse(
    inviterProfile.primaryAccountURN as AccountURN
  )
  const alias = primaryAccountURN.qcomponent?.alias
  if (!alias) {
    throw new InternalServerError({
      message: 'Inviter primary account alias not found',
    })
  }

  await node.class.inviteMember({
    inviter: alias,
    identifier,
    accountType,
    inviteCode,
  })

  return {
    inviteCode,
  }
}
