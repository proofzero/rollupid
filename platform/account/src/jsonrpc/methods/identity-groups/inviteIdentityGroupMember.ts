import { z } from 'zod'
import { Context } from '../../../context'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { RollupError } from '@proofzero/errors'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import IdentityGroup from '../../../nodes/identity-group'

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

  const DOBinding = IdentityGroup.wrap(ctx.IdentityGroup)
  const node = DOBinding.getByName(identityGroupURN)
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
