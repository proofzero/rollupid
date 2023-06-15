import { DOProxy } from 'do-proxy'
import type { Profile, AddressList } from '../types'
import { ServicePlanType, ServicePlans } from '@proofzero/types/account'

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
    delta: number
  ): Promise<void> {
    let servicePlans = await this.state.storage.get<ServicePlans>(
      'servicePlans'
    )
    if (!servicePlans) {
      servicePlans = {}
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

  async setCustomerID(customerID: string): Promise<void> {
    const servicePlans = await this.state.storage.get<ServicePlans>(
      'servicePlans'
    )

    if (!servicePlans) {
      await this.state.storage.put('servicePlans', { customerID })
    } else {
      servicePlans.customerID = customerID
      await this.state.storage.put('servicePlans', servicePlans)
    }
  }
}
