import { Alert } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { SignContainer } from '../../components/users/SignContainer'
import { ConnectWallet } from '../../components/wallet/ConnectWallet'
import { withApollo } from '../../src/apollo'
import { useCompleteMigration } from '../../src/services/UserHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'
import { getQueryParam } from '../../src/utils/nextUtils'

interface Props {
  email: string
  code: string
}

const CompleteMigrationPage = ({ email, code }: Props) => {
  const [completeMigration] = useCompleteMigration()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()
  const router = useRouter()

  const beforeLogin = async (data?: string) => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await completeMigration({
        variables: {
          email,
          code,
          data,
        },
      })
      if (res.data?.completeMigration?.result) {
        setLoading(false)
        return true
      }
      setError(new Error('Migration failed with unknown error. Please contact us on Discord.'))
    } catch (e: any) {
      setError(e)
    }
    setLoading(false)
    return false
  }

  const onSignInSuccess = () => {
    setError(undefined)
    router.push('/dashboard')
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/migrate/complete',
          title: 'Complete account migration - ChainJet',
          description: 'Complete your account migration on ChainJet.',
        })}
      </Head>

      <SignContainer>
        <div>
          {error && <Alert message={error?.message} type="error" showIcon style={{ marginBottom: 24 }} />}
          <ConnectWallet
            beforeLogin={beforeLogin}
            onSuccess={onSignInSuccess}
            onError={({ error }) => setError(error)}
            message="To complete the migration, please connect your wallet"
          />
        </div>
      </SignContainer>
    </>
  )
}

CompleteMigrationPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    email: getQueryParam(ctx, 'email'),
    code: getQueryParam(ctx, 'code'),
  }
}

export default withApollo(CompleteMigrationPage, { useLayout: false })
