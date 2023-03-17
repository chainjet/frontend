import { Alert } from 'antd'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Loading } from '../components/common/RequestStates/Loading'
import { withApollo } from '../src/apollo'
import { useStripeSubscription } from '../src/services/SubscriptionHooks'

function SubscribePage() {
  const { subscribe, error } = useStripeSubscription()
  const router = useRouter()

  useEffect(() => {
    const priceId = router.query?.p as string
    if (!priceId) {
      router.replace('/pricing')
      return
    }
    subscribe(priceId)
  })

  if (error) {
    return <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />
  }

  return <Loading />
}

export default withApollo(SubscribePage)
