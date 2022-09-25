import { gql } from '@apollo/client'
import { ProfileApiKeyForm } from '../../components/users/settings/ProfileApiKeyForm'
import { ProfileEmailForm } from '../../components/users/settings/ProfileEmailForm'
import { ProfilePublicInfoForm } from '../../components/users/settings/ProfilePublicInfoForm'
import { withApollo } from '../../src/apollo'

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

function SettingsPage() {
  // const { signer } = useSigner()
  // const { data, loading, error } = useGetViewer(userFragment, {
  //   variables: {
  //     id: signer?.id ?? '',
  //   },
  // })

  // if (loading) {
  //   return <Loading />
  // }
  // if (error || !data?.viewer) {
  //   return <RequestError error={error} />
  // }

  // const user = data.viewer

  // return (
  //   <>
  //     <Head>
  //       <title>Settings - ChainJet</title>
  //     </Head>

  //     <PageWrapper title="Settings" onBack={() => window.history.back()}>
  //       <Card title="Public info">
  //         <ProfilePublicInfoForm user={user} />
  //       </Card>

  //       <Card title="Email" style={{ marginTop: 24 }}>
  //         <ProfileEmailForm user={user} />
  //       </Card>

  //       <Card title="API Key" style={{ marginTop: 24 }}>
  //         <ProfileApiKeyForm user={user} />
  //       </Card>

  //       <Card title="Security" style={{ marginTop: 24 }}>
  //         <ProfileSecurityForm user={user} />
  //       </Card>
  //     </PageWrapper>
  //   </>
  // )
  return <></>
}

export default withApollo(SettingsPage)
