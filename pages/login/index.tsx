import { Alert } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
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
    router.push('/account')
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
      <SignContainer>
        <div>
          {error && <Alert message={error?.message} type="error" showIcon style={{ marginBottom: 24 }} />}
          <ConnectWallet onSuccess={onSignInSuccess} onError={({ error }) => setError(error)} />
        </div>
      </SignContainer>
    </>
  )
}

export default withApollo(LoginPage, { useLayout: false, ssr: false })
