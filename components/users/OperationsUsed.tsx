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
    <div className="flex flex-col items-end">
      <div className="flex">
        <span className="mr-2 text-right">Operations Used:</span>
        <span className="w-32 text-left">
          <strong>{userData.viewer.operationsUsedMonth.toLocaleString()}</strong>/
          {plan.maxOperations === Infinity ? '∞' : plan.maxOperations.toLocaleString()}
        </span>
      </div>
      <div className="flex">
        <span className="mr-2 text-right">Plan:</span>
        <span className="w-32 text-left">
          <strong>{plan.name}</strong>
        </span>
      </div>
    </div>
  )
}
