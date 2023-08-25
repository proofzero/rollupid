import { AccountURN } from '@proofzero/urns/account'

export enum ServicePlanType {
  FREE = 'FREE',
  PRO = 'PRO',
}

export type ServicePlans = {
  subscriptionID?: string
  plans?: Partial<{
    [key in ServicePlanType]: {
      entitlements: number
    }
  }>
}

export type PaymentData = {
  customerID: string
  email: string
  name: string
  paymentMethodID?: string
  accountURN?: AccountURN
}
