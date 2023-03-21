import { gql } from '@apollo/client'
import { Alert } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { plansConfig } from '../../src/constants/plans.config'
import {
  useChangeSubscriptionPlan,
  useResumeSubscription,
  useStripeSubscription,
} from '../../src/services/SubscriptionHooks'
import { useGetViewer, useSigner } from '../../src/services/UserHooks'
import { CancelSubscriptionModal } from './Modals/CancelSubscriptionModal'

type Frequency = 'monthly' | 'annually'

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const viewerFragment = gql`
  fragment PricingTable_viewer on User {
    id
    plan
    nextPlan
    planPeriodEnd
  }
`

const tiers = Object.entries(plansConfig)
  .map(([id, plan]) => ({
    ...plan,
    id,
  }))
  .filter((t) => !!t.price)

export function PricingTable() {
  dayjs.extend(relativeTime)

  const { signer } = useSigner()
  const { subscribe, error: subscribeError } = useStripeSubscription()
  const { resumeSubscription } = useResumeSubscription()
  const { changeSubscriptionPlan } = useChangeSubscriptionPlan()
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [frequency, setFrequency] = useState(frequencies[0])
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const router = useRouter()
  const {
    data: viewerData,
    loading: viewerLoading,
    refetch,
  } = useGetViewer(viewerFragment, {
    skip: !signer,
  })

  const currentPlan = signer && !viewerLoading ? viewerData?.viewer?.plan ?? 'free' : ''
  const nextPlan = viewerData?.viewer?.nextPlan
  const planPeriodEnd = viewerData?.viewer?.planPeriodEnd

  const handleSubscribeClick = async (planId: string) => {
    if (currentPlan === planId) {
      if (nextPlan) {
        setLoading({ [planId]: true })
        try {
          await resumeSubscription()
        } catch (err) {
          setError((err as Error).message)
        }
        await refetch()
        setLoading({})
      }
      return
    }
    setLoading({ [planId]: true })
    const priceId = plansConfig[planId].priceId
    if (signer) {
      if (priceId && !plansConfig[currentPlan].price?.monthly) {
        await subscribe(priceId)
      } else if (priceId) {
        try {
          await changeSubscriptionPlan({
            variables: {
              priceId,
            },
          })
        } catch (err) {
          setError((err as Error).message)
        }
        await refetch()
        setLoading({})
      } else {
        setCancelModalOpen(true)
      }
    } else if (priceId) {
      router.push(`/login?go=/complete-subscription?p=${priceId}`)
    } else {
      router.push(`/login`)
    }
  }

  const handleCredentialDelete = async () => {
    await refetch()
    setCancelModalOpen(false)
  }

  // stop loading on error
  useEffect(() => {
    if (subscribeError) {
      setLoading({})
    }
  }, [subscribeError])

  const getTierButtonText = (planId: string) => {
    const tier = tiers.find((t) => t.id === planId)!
    if (loading[tier.id]) {
      return 'Loading...'
    }
    if (!signer) {
      return 'Get started'
    }
    if (currentPlan === planId) {
      return nextPlan ? 'Resume' : 'Current Plan'
    }
    const currentPlanTier = tiers.find((t) => t.id === currentPlan)
    if (tier.price![frequency.value as Frequency] > (currentPlanTier?.price?.[frequency.value as Frequency] ?? 0)) {
      return 'Upgrade'
    }
    if (!currentPlanTier?.price) {
      return '-'
    }
    return 'Downgrade'
  }

  return (
    <div className="py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Pricing plans for everyone</p>
        </div>
        <p className="max-w-2xl mx-auto mt-6 text-lg leading-8 text-center text-gray-600">
          Choose a plan that is right for you, and scale as you grow.
        </p>
        {(subscribeError || error) && (
          <Alert
            style={{ marginBottom: 16 }}
            message="Error"
            description={subscribeError ?? error}
            type="error"
            showIcon
          />
        )}
        {/* <div className="flex justify-center mt-16">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 p-1 text-xs font-semibold leading-5 text-center rounded-full gap-x-1 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }: { checked: boolean }) =>
                  classNames(
                    checked ? 'bg-indigo-600 text-white' : 'text-gray-500',
                    'cursor-pointer rounded-full py-1 px-2.5',
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div> */}
        <div className="grid max-w-md grid-cols-1 gap-8 mx-auto mt-10 isolate md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'ring-2 ring-secondary' : 'ring-1 ring-gray-200',
                'rounded-3xl p-8',
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.mostPopular ? 'text-secondary' : 'text-gray-900',
                  'text-lg font-semibold leading-8',
                )}
              >
                {tier.name}
              </h3>
              {/* <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p> */}
              <p className="flex items-baseline mt-6 gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${tier.price![frequency.value as Frequency]}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">{frequency.priceSuffix}</span>
              </p>
              {(tier.id === currentPlan && !nextPlan) || (tier.id === nextPlan && planPeriodEnd) ? (
                <div className="mt-6 text-center text-secondary">
                  <strong>
                    {nextPlan ? `Plan after ${dayjs(planPeriodEnd).format('YYYY-MM-DD')}` : 'Current Plan'}
                  </strong>
                </div>
              ) : (
                <a
                  onClick={() => handleSubscribeClick(tier.id)}
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.mostPopular
                      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                      : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                    'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                  )}
                >
                  {getTierButtonText(tier.id)}
                </a>
              )}
              {currentPlan !== 'free' && currentPlan === tier.id && nextPlan && (
                <div className="mt-2 text-center">
                  <span className="text-red-500">Expires {dayjs(planPeriodEnd).fromNow()}</span>
                </div>
              )}
              <ul role="list" className="pl-0 mt-8 space-y-3 text-sm leading-6 text-gray-600 ">
                {tier.features!.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <span className="flex-none w-2 h-6 text-secondary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <CancelSubscriptionModal
        open={cancelModalOpen}
        currentPlan={currentPlan}
        planPeriodEnd={planPeriodEnd}
        onSubscriptionCancel={() => handleCredentialDelete()}
        onCancel={() => {
          setCancelModalOpen(false)
          setLoading({ free: false })
        }}
      />
    </div>
  )
}
