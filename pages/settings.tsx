import { gql } from '@apollo/client'
import { Card } from 'antd'
import Head from 'next/head'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { Loading } from '../components/common/RequestStates/Loading'
import { RequestError } from '../components/common/RequestStates/RequestError'
import { ProfileEmailForm } from '../components/users/settings/ProfileEmailForm'
import { withApollo } from '../src/apollo'
import { useGetViewer, useSigner } from '../src/services/UserHooks'

const userFragment = gql`
  fragment SettingsPage on User {
    id
    ...ProfileEmailForm_User
  }
  ${ProfileEmailForm.fragments.User}
`

function SettingsPage() {
  const { signer } = useSigner()
  const { data, loading, error } = useGetViewer(userFragment, {
    variables: {
      id: signer ?? '',
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.viewer) {
    return <RequestError error={error} />
  }

  const user = data.viewer

  return (
    <>
      <Head>
        <title>Settings - ChainJet</title>
      </Head>

      <PageWrapper title="Settings" onBack={() => window.history.back()}>
        <Card title="Email Settings" style={{ marginTop: 24 }}>
          <ProfileEmailForm user={user} />
        </Card>
      </PageWrapper>
    </>
  )
}

export default withApollo(SettingsPage)
