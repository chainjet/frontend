import { gql } from '@apollo/client'
import Head from 'next/head'
import Router from 'next/router'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { Loading } from '../components/common/RequestStates/Loading'
import { RequestError } from '../components/common/RequestStates/RequestError'
import { CredentialsTable } from '../components/credentials/CredentialsTable'
import { withApollo } from '../src/apollo'
import { useGetAccountCredentials } from '../src/services/AccountCredentialHooks'

const credentialsFragment = gql`
  fragment CredentialsPage on AccountCredential {
    id
    ...CredentialsTable_AccountCredential
  }
  ${CredentialsTable.fragments.AccountCredential}
`

export function CredentialsPage() {
  const { data, loading, error, refetch } = useGetAccountCredentials(credentialsFragment, {
    variables: {
      paging: {
        first: 50,
      },
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.accountCredentials?.edges) {
    return <RequestError error={error} />
  }

  const accountCredentials = data.accountCredentials.edges.map((edge) => edge.node)

  const handleGoBack = async () => {
    await Router.push('/dashboard')
  }

  return (
    <>
      <Head>
        <title>Credentials - ChainJet</title>
      </Head>
      <PageWrapper title="Credentials" onBack={handleGoBack}>
        <CredentialsTable accountCredentials={accountCredentials} onChange={refetch} />
      </PageWrapper>
    </>
  )
}

export default withApollo(CredentialsPage)
