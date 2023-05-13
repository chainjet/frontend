import { Alert, Card } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { SelectCredentials } from '../../../components/workflow-nodes/drawer/steps/credentials/SelectCredentials'
import { withApollo } from '../../../src/apollo'
import { useGetIntegrationAccounts } from '../../../src/services/IntegrationAccountHooks'
import { useRedirectGuests } from '../../../src/services/UserHooks'
import { getHeadMetatags } from '../../../src/utils/html.utils'
import { getQueryParam } from '../../../src/utils/nextUtils'

interface Props {
  integrationAccountKey?: string
}

function CreateCredentialPage({ integrationAccountKey }: Props) {
  const { signer } = useRedirectGuests()
  const router = useRouter()
  const [credentialSelected, setCredentialSelected] = useState<boolean>(false)

  const {
    data: integrationAccountData,
    loading,
    error,
  } = useGetIntegrationAccounts(SelectCredentials.fragments.IntegrationAccount, {
    variables: {
      filter: {
        key: {
          eq: integrationAccountKey!,
        },
      },
    },
  })
  const integrationAccount = integrationAccountData?.integrationAccounts?.edges?.[0]?.node

  if (error) {
    return <RequestError error={error} />
  }
  if (!signer || loading || !integrationAccount) {
    return <Loading />
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/create/credential',
          title: `Authenticate with ${integrationAccount.name}`,
          description: `Authenticate ChainJet with ${integrationAccount.name}`,
        })}
      </Head>
      <PageWrapper title={`Authenticate with ${integrationAccount.name}`} onBack={() => router.push('/dashboard')}>
        {!credentialSelected && (
          <div className="container max-w-4xl mx-auto">
            <Card>
              <SelectCredentials
                integrationAccount={integrationAccount}
                onCredentialsSelected={() => setCredentialSelected(true)}
              />
            </Card>
          </div>
        )}
        {credentialSelected && <Alert type="success" message="Succesfully authenticated" />}
      </PageWrapper>
    </>
  )
}

CreateCredentialPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const integrationAccountKey = getQueryParam(ctx, 'key').toLowerCase()
  return {
    integrationAccountKey,
  }
}

export default withApollo(CreateCredentialPage)
