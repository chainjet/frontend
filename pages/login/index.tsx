import { Alert } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NoSsr from '../../components/common/NoSsr'
import { SignContainer } from '../../components/users/SignContainer'
import { ConnectWallet } from '../../components/wallet/ConnectWallet'
import { withApollo } from '../../src/apollo'
import { getHeadMetatags } from '../../src/utils/html.utils'

interface Props {}

const LoginPage = ({}: Props) => {
  const [error, setError] = useState<Error | undefined>()
  const router = useRouter()

  const onSignInSuccess = async () => {
    setError(undefined)

    let redirectTo: string
    switch (router.query.go) {
      case 'notifications':
        redirectTo = '/create/notification'
        break
      default:
        redirectTo = '/dashboard'
    }

    const url = new URL(window.location.href)
    const integrationAccountKey = router.query.adding_integration_account
    if (integrationAccountKey) {
      const completeOAuthPath = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account-credentials/oauth/${integrationAccountKey}/callback${url.search}`
      await router.push(`${completeOAuthPath}&redirect_to=${redirectTo}`)
    } else {
      await router.push(redirectTo)
    }
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/login',
          title: 'ChainJet - Login',
          description: 'Login into ChainJet',
        })}
      </Head>
      <NoSsr>
        <SignContainer>
          <div>
            {error && <Alert message={error?.message} type="error" showIcon style={{ marginBottom: 24 }} />}
            <ConnectWallet onSuccess={onSignInSuccess} onError={({ error }) => setError(error)} showMigrationLink />
          </div>
        </SignContainer>
      </NoSsr>
    </>
  )
}

export default withApollo(LoginPage, { useLayout: false, ssr: false })
