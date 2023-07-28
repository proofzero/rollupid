import { RollupError } from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { DOProxy } from 'do-proxy'

export type InviteMemberInput = {
  identifier: string
  addressType: EmailAddressType | OAuthAddressType | CryptoAddressType
  inviteCode: string
}

export type MemberInvitation = InviteMemberInput & {
  timestamp: number
}

export type ClaimInvitationInput = {
  inviteCode: string
}

export default class IdentityGroup extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async inviteMember({
    identifier,
    addressType,
    inviteCode,
  }: InviteMemberInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    invitations.push({
      identifier,
      addressType,
      inviteCode,
      timestamp: Date.now(),
    })

    await this.state.storage.put('invitations', invitations)
  }

  async getInvitations(): Promise<MemberInvitation[]> {
    return (
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []
    )
  }

  async claimInvitation({ inviteCode }: ClaimInvitationInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const invitationIndex = invitations.findIndex(
      (invitation) => invitation.inviteCode === inviteCode
    )
    if (invitationIndex === -1) {
      throw new RollupError({
        message: 'Invitation not found',
      })
    }

    invitations.splice(invitationIndex, 1)

    await this.state.storage.put('invitations', invitations)
  }
}
