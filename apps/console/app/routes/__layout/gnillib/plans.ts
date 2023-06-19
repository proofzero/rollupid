import { ServicePlanType } from '@proofzero/types/account'

type PlanFeature = {
  title: string
  type: 'base' | 'addon' | 'future'
}

const baseFeatures: PlanFeature[] = [
  {
    title: 'Unlimited MAUs',
    type: 'base',
  },
  {
    title: 'Wallet Login',
    type: 'base',
  },
  {
    title: 'Social Logins',
    type: 'base',
  },
  {
    title: 'Smart Contract Wallets',
    type: 'base',
  },
  {
    title: 'API Access',
    type: 'base',
  },
  {
    title: 'Community Support',
    type: 'base',
  },
  {
    title: 'Email Login',
    type: 'base',
  },
]

const proFeatures: PlanFeature[] = [
  ...baseFeatures,
  {
    title: 'Custom Branding',
    type: 'addon',
  },
  {
    title: 'Custom Domain',
    type: 'addon',
  },
  {
    title: 'Custom OAuth Credentials',
    type: 'addon',
  },
  {
    title: '4337 App Wallet',
    type: 'future',
  },
  {
    title: 'Object Storage',
    type: 'future',
  },
  {
    title: 'Groups',
    type: 'future',
  },
  {
    title: 'Managed Sessions',
    type: 'future',
  },
]

export type PlanDetails = {
  title: string
  description: string
  price: number
  features: PlanFeature[]
}

const proPlan: PlanDetails = {
  title: 'Pro Plan',
  description: 'Unlimited Proof of Proofs',
  price: 29,
  features: proFeatures,
}

export default {
  [ServicePlanType.PRO]: proPlan,
}
