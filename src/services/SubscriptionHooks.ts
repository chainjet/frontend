import { gql, useMutation } from '@apollo/client'
import { loadStripe } from '@stripe/stripe-js'
import { useCallback, useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useCreateCheckoutSession() {
  const mutation = gql`
    mutation createCheckoutSession($planId: String!) {
      createCheckoutSession(planId: $planId) {
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

  const subscribe = useCallback(
    async (planId: string) => {
      setLoading(true)
      setError(null)

      try {
        const stripe = await stripePromise
        if (!stripe) {
          return
        }
        const res = await createCheckoutSession({
          variables: {
            planId,
          },
        })
        const sessionId = res.data?.createCheckoutSession?.sessionId
        if (!sessionId) {
          throw new Error('Unexpected error')
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
    [createCheckoutSession],
  )

  return { subscribe, loading, error }
}
