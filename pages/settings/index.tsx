import { gql } from '@apollo/client'
import { Card } from 'antd'
import Head from 'next/head'
import React from 'react'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../components/common/RequestStates/Loading'
import { RequestError } from '../../components/common/RequestStates/RequestError'
import { ProfileApiKeyForm } from '../../components/users/settings/ProfileApiKeyForm'
import { ProfileEmailForm } from '../../components/users/settings/ProfileEmailForm'
import { ProfilePublicInfoForm } from '../../components/users/settings/ProfilePublicInfoForm'
import { ProfileSecurityForm } from '../../components/users/settings/ProfileSecurityForm'
import { withApollo } from '../../src/apollo'
import { useGetViewer, useViewer } from '../../src/services/UserHooks'

// TODO design similar to: https://preview.pro.ant.design/account/settings

const userFragment = gql`
  fragment SettingsPage on User {
    id
    ...ProfilePublicInfoForm_User
    ...ProfileEmailForm_User
    ...ProfileApiKeyForm_User
  }
  ${ProfilePublicInfoForm.fragments.User}
  ${ProfileEmailForm.fragments.User}
  ${ProfileApiKeyForm.fragments.User}
`

function SettingsPage () {
  const { viewer } = useViewer()
  const { data, loading, error } = useGetViewer(userFragment, {
    variables: {
      id: viewer?.id ?? ''
    }
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

        <Card title="Public info">
          <ProfilePublicInfoForm user={user} />
        </Card>

        <Card title="Email" style={{ marginTop: 24 }}>
          <ProfileEmailForm user={user} />
        </Card>

        <Card title="API Key" style={{ marginTop: 24 }}>
          <ProfileApiKeyForm user={user} />
        </Card>

        <Card title="Security" style={{ marginTop: 24 }}>
          <ProfileSecurityForm user={user} />
        </Card>

      </PageWrapper>
    </>
  )
}

export default withApollo(SettingsPage)
