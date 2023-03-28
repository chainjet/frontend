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
  minPollingInterval: number
}

export const defaultPlan = 'free'

export const plansConfig: Record<string, PlanConfig> = {
  free: {
    key: 'free',
    name: 'Free',
    maxOperations: 10000,
    price: { monthly: 0, annually: 0 },
    features: [
      '10,000 operations per month',
      '5 active workflows',
      '3 blockchain listeners',
      '15 minutes polling interval',
    ],
    minPollingInterval: 900,
  },
  prod_NbsBYZA9BxFF7r: {
    key: 'starter',
    name: 'Starter',
    maxOperations: 30000,
    priceId: 'price_1MqeRZFrRlOZNZ9xl2OQmgP2',
    price: { monthly: 9, annually: 9 * 12 },
    features: [
      '30,000 operations per month',
      '25 active workflows',
      '10 blockchain listeners',
      '5 minutes polling interval',
      'Execute workflows on error',
    ],
    minPollingInterval: 300,
  },
  prod_NYG90VSEfU0TfQ: {
    key: 'core',
    name: 'Core',
    maxOperations: 1e5,
    priceId: 'price_1Mn9dEFrRlOZNZ9xzskkpkvH',
    price: { monthly: 29, annually: 29 * 12 },
    features: [
      '100,000 operations per month',
      'Unlimited active workflows',
      '30 blockchain listeners',
      '1 minute polling interval',
      'Execute workflows on error',
    ],
    minPollingInterval: 60,
  },
  prod_NYGB1kY91pq5g6: {
    key: 'pro',
    name: 'Pro',
    maxOperations: 3e5,
    priceId: 'price_1Mn9efFrRlOZNZ9x4TRtYO9a',
    price: { monthly: 79, annually: 79 * 12 },
    mostPopular: true,
    features: [
      '300,000 operations per month',
      'Unlimited active workflows',
      '100 blockchain listeners',
      '15 seconds polling interval',
      'Execute workflows on error',
    ],
    minPollingInterval: 15,
  },
  prod_NYGCd7KzrCjd7Y: {
    key: 'buiness',
    name: 'Business',
    maxOperations: 750000,
    priceId: 'price_1Mn9g3FrRlOZNZ9xm51JiAMP',
    price: { monthly: 199, annually: 199 * 12 },
    features: [
      '750,000 operations per month',
      'Unlimited active workflows',
      '250 blockchain listeners',
      '15 seconds polling interval',
      'Execute workflows on error',
    ],
    minPollingInterval: 15,
  },
  unlimited: {
    key: 'unlimited',
    name: 'Unlimited',
    maxOperations: Infinity,
    minPollingInterval: 15,
  },
  early: {
    key: 'early',
    name: 'Free (Deprecated)',
    maxOperations: Infinity,
    minPollingInterval: 60,
  },
}

// Plans on Stripe test mode
if (process.env.NODE_ENV === 'development') {
  // starter
  plansConfig['prod_NbsFKhWJ6PMBpx'] = plansConfig['prod_NbsBYZA9BxFF7r']
  plansConfig['prod_NbsFKhWJ6PMBpx'].priceId = 'price_1MqeVIFrRlOZNZ9x9wEp6W2G'
  delete plansConfig['prod_NbsBYZA9BxFF7r']
  // core
  plansConfig['prod_NXQOvZowLlwuaH'] = plansConfig['prod_NYG90VSEfU0TfQ']
  plansConfig['prod_NXQOvZowLlwuaH'].priceId = 'price_1MmLXfFrRlOZNZ9xynfzzKnP'
  delete plansConfig['prod_NYG90VSEfU0TfQ']
  // pro
  plansConfig['prod_NXsxne4WGLGVct'] = plansConfig['prod_NYGB1kY91pq5g6']
  plansConfig['prod_NXsxne4WGLGVct'].priceId = 'price_1MmnBNFrRlOZNZ9xVy2DRZoi'
  delete plansConfig['prod_NYGB1kY91pq5g6']
  // business
  plansConfig['prod_NXsy6KRk62T4yx'] = plansConfig['prod_NYGCd7KzrCjd7Y']
  plansConfig['prod_NXsy6KRk62T4yx'].priceId = 'price_1MmnCCFrRlOZNZ9xyolAnxpd'
  delete plansConfig['prod_NYGCd7KzrCjd7Y']
}
