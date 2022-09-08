import { Alert } from 'antd'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Loading } from '../../components/common/RequestStates/Loading'
import { withApollo } from '../../src/apollo'
import { useVerifyEmail } from '../../src/services/UserHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'
import { getQueryParam } from '../../src/utils/nextUtils'

interface Props {
  username: string
  code: string
}

const CompleteSignupPage = (props: Props) => {
  const { username, code } = props
  const [verifyEmail] = useVerifyEmail()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const res = await verifyEmail({
        variables: {
          username,
          code,
        },
      })
      if (res.data.verifyEmail.error) {
        setError(res.data.verifyEmail.error)
      } else {
        await Router.push('/account')
      }
    })()
  }, [code, username, verifyEmail])

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/complete-signup',
          title: 'Complete Sign Up - ChainJet',
          description: 'Complete ChainJet Sign Up.',
        })}
      </Head>
      {error ? <Alert type="error" message={error} /> : <Loading />}
    </>
  )
}

CompleteSignupPage.getInitialProps = (ctx: NextPageContext) => {
  return {
    username: getQueryParam(ctx, 'username'),
    code: getQueryParam(ctx, 'code'),
  }
}

export default withApollo(CompleteSignupPage, { useLayout: false })
