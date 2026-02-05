export type PlanType = 'free' | 'pro' | 'enterprise'

export interface PlanFeature {
  text: string
  included: boolean
}

export interface Plan {
  id: PlanType
  name: string
  price: number
  billingPeriod: 'month' | 'year'
  description: string
  features: PlanFeature[]
  limits: {
    calls: number | 'unlimited'
    agents: number | 'unlimited'
    users: number | 'unlimited'
    storage: string
  }
  popular?: boolean
  cta: string
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    description: 'Perfect for testing and small projects',
    features: [
      { text: '100 calls per month', included: true },
      { text: '1 AI voice agent', included: true },
      { text: 'Up to 2 team members', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'CRM integration', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Priority support', included: false },
    ],
    limits: {
      calls: 100,
      agents: 1,
      users: 2,
      storage: '1 GB',
    },
    cta: 'Start Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    billingPeriod: 'month',
    description: 'For growing businesses and teams',
    features: [
      { text: '1,000 calls per month', included: true },
      { text: 'Up to 5 AI voice agents', included: true },
      { text: 'Up to 10 team members', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'CRM integration (HubSpot, Salesforce)', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Webhook integrations', included: true },
    ],
    limits: {
      calls: 1000,
      agents: 5,
      users: 10,
      storage: '10 GB',
    },
    popular: true,
    cta: 'Start Pro Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    billingPeriod: 'month',
    description: 'For large organizations with custom needs',
    features: [
      { text: 'Unlimited calls', included: true },
      { text: 'Unlimited AI voice agents', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom analytics & reporting', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'All CRM integrations', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Custom integrations & API', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    limits: {
      calls: 'unlimited',
      agents: 'unlimited',
      users: 'unlimited',
      storage: 'Unlimited',
    },
    cta: 'Contact Sales',
  },
]

export function getPlanById(planId: PlanType): Plan | undefined {
  return plans.find(plan => plan.id === planId)
}

export function getPlanFeatures(planId: PlanType): PlanFeature[] {
  const plan = getPlanById(planId)
  return plan?.features || []
}

export function getPlanLimits(planId: PlanType) {
  const plan = getPlanById(planId)
  return plan?.limits
}

export function formatPrice(price: number): string {
  return price === 0 ? 'Free' : `$${price}`
}

