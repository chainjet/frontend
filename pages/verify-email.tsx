import { Alert } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Loading } from '../components/common/RequestStates/Loading'
import { withApollo } from '../src/apollo'
import { useVerifyEmail } from '../src/services/UserHooks'
import { getHeadMetatags } from '../src/utils/html.utils'
import { getQueryParam } from '../src/utils/nextUtils'

interface Props {
  address: string
  code: string
}

const CompleteSignupPage = ({ address, code }: Props) => {
  const [verifyEmail] = useVerifyEmail()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const res = await verifyEmail({
        variables: {
          address,
          code,
        },
      })
      if (res.data.verifyEmail.error) {
        setError(res.data.verifyEmail.error)
      } else {
        await Router.push('/dashboard')
      }
    })()
  }, [address, code, verifyEmail])

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/verify-email',
          title: 'Verify your ChainJet Email',
          description: 'Verify your ChainJet Email.',
        })}
      </Head>
      {error ? <Alert type="error" message={error} /> : <Loading />}
    </>
  )
}

CompleteSignupPage.getInitialProps = (ctx: NextPageContext) => {
  return {
    address: getQueryParam(ctx, 'address'),
    code: getQueryParam(ctx, 'code'),
  }
}

export default withApollo(CompleteSignupPage, { useLayout: false })
