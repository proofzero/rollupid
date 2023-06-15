export type AccountProfile = {
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
}

export enum ServicePlanType {
  UNDEFINED = 'UNDEFINED',
  PRO = 'PRO',
}

export type ServicePlans = {
  customerID?: string
  plans?: Partial<{
    [key in ServicePlanType]: {
      entitlements: number
    }
  }>
}
