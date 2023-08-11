import { z } from 'zod'
import { Context } from '../../../context'
import { InternalServerError } from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { router } from '@proofzero/platform.core'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'
import generateRandomString from '@proofzero/utils/generateRandomString'
import { AccountURN } from '@proofzero/urns/account'

export const InviteIdentityGroupMemberInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  identifier: z.string(),
  addressType: z.union([
    z.nativeEnum(EmailAddressType),
    z.nativeEnum(OAuthAddressType),
    z.nativeEnum(CryptoAddressType),
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
  const { identityGroupURN, identifier, addressType } = input
  const inviterAccountURN = ctx.accountURN as AccountURN

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
  const inviterProfile = await caller.account.getProfile({
    account: inviterAccountURN,
  })
  if (!inviterProfile) {
    throw new InternalServerError({
      message: 'Inviter profile not found',
    })
  }

  const primaryAddressURN = AddressURNSpace.componentizedParse(
    inviterProfile.primaryAddressURN as AddressURN
  )
  const alias = primaryAddressURN.qcomponent?.alias
  if (!alias) {
    throw new InternalServerError({
      message: 'Inviter primary address alias not found',
    })
  }

  await node.class.inviteMember({
    inviter: alias,
    identifier,
    addressType,
    inviteCode,
  })

  return {
    inviteCode,
  }
}
