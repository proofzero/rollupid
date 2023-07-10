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

export const inviteIdentityGroupMember = async ({
  input,
  ctx,
}: {
  input: InviteIdentityGroupMemberInput
  ctx: Context
}): Promise<void> => {
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

  await node.class.inviteMember({
    identifier,
    addressType,
  })
}
