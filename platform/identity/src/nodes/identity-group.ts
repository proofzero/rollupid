import {
  InternalServerError,
  RollupError,
  UnauthorizedError,
} from '@proofzero/errors'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import {
  ServicePlans,
  ServicePlanType,
  PaymentData,
  Seats,
} from '@proofzero/types/billing'
import { IdentityURN } from '@proofzero/urns/identity'
import { DOProxy } from 'do-proxy'
import { NodeMethodReturnValue } from '@proofzero/types/node'
import { IDENTITY_GROUP_OPTIONS } from '../constants'

export type InviteMemberInput = {
  identifier: string
  accountType: EmailAccountType | OAuthAccountType | CryptoAccountType
  inviteCode: string
  inviter: string
}

export type MemberInvitation = InviteMemberInput & {
  timestamp: number
}

export type ClearInvitationInput = {
  inviteCode: string
}

export default class IdentityGroup extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getServicePlans(): Promise<ServicePlans | undefined> {
    return this.state.storage.get<ServicePlans>('servicePlans')
  }

  async updateEntitlements(
    type: ServicePlanType,
    quantity: number,
    subscriptionID: string
  ): Promise<void> {
    let servicePlans = await this.state.storage.get<ServicePlans>(
      'servicePlans'
    )
    if (!servicePlans) {
      servicePlans = {}
    }

    if (!servicePlans.subscriptionID) {
      servicePlans.subscriptionID = subscriptionID
    } else {
      if (servicePlans.subscriptionID !== subscriptionID) {
        throw new RollupError({
          message: 'Subscription ID mismatch',
        })
      }
    }

    if (!servicePlans.plans) {
      servicePlans.plans = {}
    }

    if (!servicePlans.plans[type]) {
      servicePlans.plans[type] = { entitlements: 0 }
    }

    // Non-null assertion operator is used
    // because of checks in previous lines
    servicePlans.plans[type]!.entitlements = quantity

    await this.state.storage.put('servicePlans', servicePlans)
  }

  async getStripePaymentData(): Promise<PaymentData | undefined> {
    return this.state.storage.get<PaymentData>('stripePaymentData')
  }

  async setStripePaymentData(paymentData: PaymentData): Promise<void> {
    const stored = await this.state.storage.get<PaymentData | undefined>(
      'stripePaymentData'
    )

    if (stored && stored.customerID !== paymentData.customerID) {
      throw new RollupError({
        message: 'Customer ID already set',
      })
    }

    await this.state.storage.put('stripePaymentData', paymentData)
  }

  async inviteMember({
    inviter,
    identifier,
    accountType,
    inviteCode,
  }: InviteMemberInput): Promise<void> {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const now = Date.now()

    invitations.push({
      inviter,
      identifier,
      accountType,
      inviteCode,
      timestamp: now,
    })

    // Set alarm one day and 5 minutes from now
    this.state.storage.setAlarm(now + 86_700_000)

    await this.state.storage.put('invitations', invitations)
  }

  async getInvitations(): Promise<MemberInvitation[]> {
    return (
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []
    )
  }

  async clearInvitation({ inviteCode }: ClearInvitationInput): Promise<void> {
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

  async alarm() {
    const invitations =
      (await this.state.storage.get<MemberInvitation[]>('invitations')) || []

    const now = Date.now()

    // Remove all invitations sent more than one day ago
    const validInvitations = invitations.filter(
      (invitation) => now - invitation.timestamp < 86_400_000
    )

    await this.state.storage.put('invitations', validInvitations)
  }

  async updateSeats(quantity: number, subscriptionID: string): Promise<void> {
    let seats = await this.state.storage.get<Seats>('seats')
    if (!seats) {
      seats = {
        subscriptionID,
        quantity,
      }
    } else {
      if (seats.subscriptionID !== subscriptionID) {
        throw new RollupError({
          message: 'Subscription ID mismatch',
        })
      }

      seats.quantity = quantity
    }

    await this.state.storage.put('seats', seats)
  }

  async getSeats(): Promise<Seats | undefined> {
    return this.state.storage.get<Seats>('seats')
  }

  async getOrderedMembers(): Promise<IdentityURN[]> {
    const orderedMembers = await this.state.storage.get<IdentityURN[]>(
      'orderedMembers'
    )

    return orderedMembers || []
  }

  async setOrderedMembers(members: IdentityURN[]): Promise<void> {
    await this.state.storage.put('orderedMembers', members)
  }

  async setPaymentFailed(failed = true) {
    const paymentData = await this.getStripePaymentData()
    if (!paymentData) {
      throw new InternalServerError({
        message: 'No payment data found',
      })
    }

    paymentData.paymentFailed = failed

    await this.state.storage.put('stripePaymentData', paymentData)
  }

  async validateAdmin(
    identityURN: IdentityURN
  ): Promise<NodeMethodReturnValue<boolean, RollupError>> {
    const storageRes = await this.state.storage.get([
      'stripePaymentData',
      'orderedMembers',
      'seats',
    ])

    const spd = storageRes.get('stripePaymentData') as PaymentData | undefined
    const orderedMembers = storageRes.get('orderedMembers') as
      | IdentityURN[]
      | undefined
    const seats = storageRes.get('seats') as Seats | undefined

    if (!orderedMembers) {
      return {
        error: new InternalServerError({
          message: 'No ordered members found',
        }),
      }
    }

    if (!spd || (spd && spd.paymentFailed)) {
      const freeMembers = orderedMembers.slice(
        0,
        IDENTITY_GROUP_OPTIONS.maxFreeMembers
      )

      if (!freeMembers.includes(identityURN)) {
        return {
          error: new UnauthorizedError({
            message: 'Unauthorized',
          }),
        }
      }
    } else if (spd) {
      const seatCount =
        IDENTITY_GROUP_OPTIONS.maxFreeMembers + (seats?.quantity || 0)
      const members = orderedMembers.slice(0, seatCount)

      if (!members.includes(identityURN)) {
        return {
          error: new UnauthorizedError({
            message: 'Unauthorized',
          }),
        }
      }
    }

    return {
      value: true,
    }
  }
}
