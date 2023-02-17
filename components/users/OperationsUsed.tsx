import { gql } from '@apollo/client'
import { useGetViewer, useSigner } from '../../src/services/UserHooks'

const userFragment = gql`
  fragment OperationsUsed_User on User {
    id
    operationsUsedMonth
  }
`

export function OperationsUsed() {
  const { signer } = useSigner()
  const { data: userData } = useGetViewer(userFragment, {
    skip: !signer,
    variables: {
      id: signer ?? '',
    },
  })

  if (!userData?.viewer.operationsUsedMonth) {
    return <></>
  }

  return (
    <div>
      Operations Used: <strong>{userData.viewer.operationsUsedMonth.toLocaleString()}</strong>/∞
    </div>
  )
}
