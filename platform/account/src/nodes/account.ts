import { DOProxy } from 'do-proxy'
import type { Profile, AddressList } from '../types'
import {
  PendingServicePlans,
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

  async getServicePlanOrders(): Promise<PendingServicePlans | undefined> {
    return this.state.storage.get<PendingServicePlans>('pendingServicePlans')
  }

  async registerServicePlanOrder(
    type: ServicePlanType,
    quantity: number,
    nonce: string
  ): Promise<void> {
    let psp = await this.state.storage.get<PendingServicePlans>(
      'pendingServicePlans'
    )

    if (!psp) {
      psp = {}
    }
    psp[nonce] = {
      type,
      quantity,
    }

    await this.state.storage.put('pendingServicePlans', psp)
  }

  async fullfillServicePlanOrder(
    nonce: string,
    subscriptionID: string
  ): Promise<void> {
    const psp = await this.state.storage.get<PendingServicePlans>(
      'pendingServicePlans'
    )
    if (!psp) {
      throw new RollupError({
        message: 'No pending service plans found',
      })
    }

    const order = psp[nonce]
    if (!order) {
      throw new RollupError({
        message: 'No order found for nonce',
      })
    }

    await this.updateEntitlements(order.type, order.quantity, subscriptionID)

    delete psp[nonce]

    await this.state.storage.put('pendingServicePlans', psp)
  }

  async getServicePlans(): Promise<ServicePlans | undefined> {
    // await this.state.storage.delete('servicePlans')
    // await this.state.storage.delete('pendingServicePlans')
    // await this.state.storage.delete('customerID')

    return this.state.storage.get<ServicePlans>('servicePlans')
  }

  async updateEntitlements(
    type: ServicePlanType,
    delta: number,
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
    servicePlans.plans[type]!.entitlements += delta

    // Fix negative entitlements
    if (servicePlans.plans[type]!.entitlements < 0) {
      console.warn('Negative entitlements detected, resetting to 0')
      servicePlans.plans[type]!.entitlements = 0
    }

    await this.state.storage.put('servicePlans', servicePlans)
  }

  async getCustomerID(): Promise<string | undefined> {
    return this.state.storage.get<string | undefined>('customerID')
  }

  async setCustomerID(customerID: string): Promise<void> {
    const stored = await this.state.storage.get<string | undefined>(
      'customerID'
    )

    if (stored && stored !== customerID) {
      throw new RollupError({
        message: 'Customer ID already set',
      })
    }

    if (stored && stored === customerID) {
      return
    }

    await this.state.storage.put('customerID', customerID)
  }
}
