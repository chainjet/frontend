import { gql } from '@apollo/client'
import { defaultPlan, plansConfig } from '../../src/constants/plans.config'
import { useGetViewer, useSigner } from '../../src/services/UserHooks'

const userFragment = gql`
  fragment OperationsUsed_User on User {
    id
    operationsUsedMonth
    plan
  }
`

export function OperationsUsed() {
  const { signer } = useSigner()
  const { data: userData } = useGetViewer(userFragment, {
    skip: !signer,
  })

  if (!userData || !Number.isFinite(userData.viewer.operationsUsedMonth)) {
    return <></>
  }

  const plan = plansConfig[userData.viewer.plan ?? defaultPlan]
  return (
    <div>
      Operations Used: <strong>{userData.viewer.operationsUsedMonth.toLocaleString()}</strong>/
      {plan.maxOperations === Infinity ? '∞' : plan.maxOperations.toLocaleString()}
    </div>
  )
}
