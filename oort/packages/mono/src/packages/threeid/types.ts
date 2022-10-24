export interface InviteCodeConfig {
  contract_address: string
  length: number
  tier: string
}

export interface InviteHolder {
  address: string
  timestamp: number
}

export interface InviteCode {
  code: string
  holders: InviteHolder[]
}

export type GetInviteCodeParams = []
export type GetInviteCodeResult = InviteCode

export interface ListInvitationItem {
  contractAddress: string
  tokenId: string
  title: string
  image: string
}

export type ListInvitationsParams = []
export type ListInvitationsResult = ListInvitationItem[]

export type RedeemInvitationParams = [string, string]
export type RedeemInvitationResult = boolean

export type RegisterNameParams = [string]
export type RegisterNameResult = void

export type UnregisterNameParams = [string]
export type UnregisterNameResult = void
