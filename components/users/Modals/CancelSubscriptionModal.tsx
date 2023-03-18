import { Button, Modal } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { plansConfig } from '../../../src/constants/plans.config'
import { useChangeSubscriptionPlan } from '../../../src/services/SubscriptionHooks'

interface Props {
  open: boolean
  currentPlan: string
  planPeriodEnd: Date
  onSubscriptionCancel: () => void
  onCancel: () => void
}

export const CancelSubscriptionModal = ({
  open,
  currentPlan,
  planPeriodEnd,
  onSubscriptionCancel,
  onCancel,
}: Props) => {
  const [loading, setLoading] = useState(false)
  const { changeSubscriptionPlan } = useChangeSubscriptionPlan()

  const handleCancel = async () => {
    setLoading(true)
    await changeSubscriptionPlan({
      variables: {
        priceId: 'free',
      },
    })
    onSubscriptionCancel()
    setLoading(false)
  }

  const plan = plansConfig[currentPlan]

  // data is still loading
  if (!plan) {
    return <></>
  }

  return (
    <Modal
      open={open}
      title={'Are you sure you want to cancel?'}
      onOk={handleCancel}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          No, keep my subscription
        </Button>,
        <Button danger key="submit" type="primary" loading={!!loading} onClick={handleCancel}>
          Yes, cancel it
        </Button>,
      ]}
    >
      <p>Are you sure you want to cancel your subscription?</p>
      <p>
        If you confirm, you won&#39;t have access to the plan <strong>{plan.name}</strong> after{' '}
        {dayjs(planPeriodEnd).format('YYYY-MM-DD')}.
      </p>
    </Modal>
  )
}
