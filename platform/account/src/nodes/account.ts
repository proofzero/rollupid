import { DOProxy } from 'do-proxy'
import type { Profile, AddressList } from '../types'
import {
  PaymentData,
  ServicePlanType,
  ServicePlans,
} from '@proofzero/types/account'
import { RollupError } from '@proofzero/errors'

export default class Account extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getProfile(): Promise<Profile | null> {
    const stored = await this.state.storage.get<Profile>('profile')
    return stored || null
  }

  async setProfile(profile: Profile): Promise<void> {
    return this.state.storage.put('profile', profile)
  }

  async getAddresses(): Promise<AddressList | null> {
    const stored = await this.state.storage.get<AddressList>('addresses')
    return stored || null
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
}
