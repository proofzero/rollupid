import { ServicePlanType } from '@proofzero/types/account'

type PlanFeature = {
  title: string
  type: 'current' | 'future'
  aggregateFeatures?: PlanFeature[]
}

const baseFeatures: PlanFeature[] = [
  {
    title: 'Unlimited MAUs',
    type: 'current',
  },
  {
    title: 'Wallet Login',
    type: 'current',
  },
  {
    title: 'Social Logins',
    type: 'current',
  },
  {
    title: 'Smart Contract Wallets',
    type: 'current',
  },
  {
    title: 'API Access',
    type: 'current',
  },
  {
    title: 'Community Support',
    type: 'current',
  },
  {
    title: 'Email Login',
    type: 'current',
  },
  {
    title: 'Account Linking',
    type: 'current',
  },
  {
    title: 'Passkeys',
    type: 'future',
  },
  {
    title: 'SOC2',
    type: 'future',
  },
  {
    title: 'Organizations',
    type: 'future',
  },
]

const proFeatures: PlanFeature[] = [
  {
    title: 'Free Plan Features',
    type: 'current',
    aggregateFeatures: baseFeatures,
  },
  {
    title: 'Custom Branding',
    type: 'current',
  },
  {
    title: 'Custom Domain',
    type: 'current',
  },
  {
    title: 'Custom OAuth Credentials',
    type: 'current',
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

const freePlan: PlanDetails = {
  title: 'Free Plan',
  description: 'Everything you need to get started.',
  price: 0,
  features: baseFeatures,
}

const proPlan: PlanDetails = {
  title: 'Pro Plan',
  description:
    'Everything in free & Custom Domain Configuration, Custom OAuth Credentials and more.',
  price: 29,
  features: proFeatures,
}

export default {
  [ServicePlanType.FREE]: freePlan,
  [ServicePlanType.PRO]: proPlan,
}
