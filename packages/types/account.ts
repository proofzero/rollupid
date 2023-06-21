export type AccountProfile = {
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
}

export enum ServicePlanType {
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
  paymentMethodID?: string
}
