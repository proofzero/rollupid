import { z } from 'zod'
import { Context } from '../../../context'
import { RollupError } from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'

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

  const node = await initIdentityGroupNodeByName(
    identityGroupURN,
    ctx.IdentityGroup
  )
  if (!node) {
    throw new RollupError({
      message: 'Identity group DO not found',
    })
  }

  const inviteCode = hexlify(
    randomBytes(IDENTITY_GROUP_OPTIONS.inviteCodeLength)
  )

  await node.class.inviteMember({
    identifier,
    addressType,
    inviteCode,
  })

  return {
    inviteCode,
  }
}
