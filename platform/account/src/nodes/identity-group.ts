import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import { DOProxy } from 'do-proxy'

export type InviteMemberInput = {
  identifier: string
  addressType: EmailAddressType | OAuthAddressType | CryptoAddressType
}

export type MemberInvitation = InviteMemberInput & {
  timestamp: number
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
  }: InviteMemberInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    invitations.push({
      identifier,
      addressType,
      timestamp: Date.now(),
    })

    await this.state.storage.put('invitations', invitations)
  }

  async getInvitations(): Promise<MemberInvitation[]> {
    return (
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []
    )
  }
}
