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

  const onSignInSuccess = () => {
    setError(undefined)
    switch (router.query.go) {
      case 'notifications':
        router.push('/create/notification')
        break
      default:
        router.push('/dashboard')
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
