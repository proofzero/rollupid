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

export type PendingServicePlans = {
  [key: string]: {
    type: ServicePlanType
    quantity: number
  }
}

export type ServicePlans = {
  subscriptionID?: string
  plans?: Partial<{
    [key in ServicePlanType]: {
      entitlements: number
    }
  }>
}
