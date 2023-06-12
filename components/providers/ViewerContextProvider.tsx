import { gql } from '@apollo/client'
import { ApolloError } from '@apollo/react-hooks'
import { createContext } from 'react'
import { User } from '../../graphql'
import { useGetViewer } from '../../src/services/UserHooks'
import { QueryById } from '../../src/typings/GraphQL'

export const ViewerContext = createContext<{
  viewer?: User
  loading: boolean
  error?: ApolloError
  refetch?: (variables?: Partial<QueryById> | undefined) => Promise<any>
}>({ loading: true })

interface Props {
  signer?: string
  children: JSX.Element[] | JSX.Element
}

// TODO operationsReset is needed here only notify deprecation of early plans
const userFragment = gql`
  fragment ViewerContext_User on User {
    id
    plan
    operationsReset
    features
    email
  }
`

const ViewerContextProvider = ({ signer, children }: Props) => {
  const { data, loading, error, refetch } = useGetViewer(userFragment, {
    skip: !signer,
  })

  return (
    <ViewerContext.Provider value={{ viewer: data?.viewer, loading, error, refetch }}>
      {children}
    </ViewerContext.Provider>
  )
}

export default ViewerContextProvider
