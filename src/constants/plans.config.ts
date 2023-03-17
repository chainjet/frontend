export interface PlanConfig {
  key: string
  name: string
  maxOperations: number
  priceId?: string
  price?: {
    monthly: number
    annually: number
  }
  mostPopular?: boolean
  features?: string[]
}

export const defaultPlan = 'early' // TODO make free plan the default

export const plansConfig: Record<string, PlanConfig> = {
  free: {
    key: 'free',
    name: 'Free',
    maxOperations: 10000,
    price: { monthly: 0, annually: 0 },
    features: ['10,000 operations per month', '3 active workflows', '15 minutes polling interval'],
  },
  prod_NXQOvZowLlwuaH: {
    key: 'starter',
    name: 'Starter',
    maxOperations: 1e5,
    priceId: 'price_1MmLXfFrRlOZNZ9xynfzzKnP',
    price: { monthly: 29, annually: 29 * 12 },
    features: [
      '100,000 operations per month',
      'Unlimited active workflows',
      '1 minute polling interval',
      'Execute workflows on error',
    ],
  },
  stripe_plan_id_2: {
    key: 'pro',
    name: 'Pro',
    maxOperations: 3e5,
    priceId: 'price_1MmLXfFrRlOZNZ9xynfzzKnP',
    price: { monthly: 79, annually: 79 * 12 },
    mostPopular: true,
    features: [
      '300,000 operations per month',
      'Unlimited active workflows',
      '15 seconds polling interval',
      'Execute workflows on error',
    ],
  },
  business: {
    key: 'buiness',
    name: 'Business',
    maxOperations: 750000,
    priceId: 'price_1MmLXfFrRlOZNZ9xynfzzKnP',
    price: { monthly: 199, annually: 199 * 12 },
    features: [
      '750,000 operations per month',
      'Unlimited active workflows',
      '15 seconds polling interval',
      'Execute workflows on error',
    ],
  },
  internal: {
    key: 'internal',
    name: 'Internal',
    maxOperations: Infinity,
  },
  early: {
    key: 'early',
    name: 'Early (Deprecated)',
    maxOperations: Infinity,
  },
}
