import { gql, useMutation } from '@apollo/client'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useCreateCheckoutSession() {
  const mutation = gql`
    mutation createCheckoutSession($priceId: String!) {
      createCheckoutSession(priceId: $priceId) {
        sessionId
      }
    }
  `
  return useMutation(mutation)
}

export const useStripeSubscription = () => {
  const [createCheckoutSession] = useCreateCheckoutSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const subscribe = useCallback(
    async (priceId: string) => {
      setLoading(true)
      setError(null)

      try {
        const stripe = await stripePromise
        if (!stripe) {
          return
        }
        const res = await createCheckoutSession({
          variables: {
            priceId,
          },
        })
        const sessionId = res.data?.createCheckoutSession?.sessionId
        if (!sessionId) {
          await router.push('/pricing')
          return
        }

        const { error } = await stripe.redirectToCheckout({ sessionId })

        if (error) {
          throw new Error(error.message)
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    },
    [createCheckoutSession, router],
  )

  return { subscribe, loading, error }
}

const resumeSubscriptionMutation = gql`
  mutation resumeSubscription {
    resumeSubscription {
      success
    }
  }
`

export const useResumeSubscription = () => {
  const [resumeSubscription] = useMutation(resumeSubscriptionMutation)
  return { resumeSubscription }
}

const cancelSubscriptionMutation = gql`
  mutation changeSubscriptionPlan($priceId: String!) {
    changeSubscriptionPlan(priceId: $priceId) {
      success
    }
  }
`

export const useChangeSubscriptionPlan = () => {
  const [changeSubscriptionPlan] = useMutation(cancelSubscriptionMutation)
  return { changeSubscriptionPlan }
}
