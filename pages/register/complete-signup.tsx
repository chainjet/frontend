import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import { useVerifyEmail } from '../../src/services/UserHooks'
import Head from 'next/head'
import { Loading } from '../../components/common/RequestStates/Loading'
import { withApollo } from '../../src/apollo'
import { NextPageContext } from 'next'
import { getQueryParam } from '../../src/utils/nextUtils'
import { Alert } from 'antd'
import { getHeadMetatags } from '../../src/utils/html.utils'

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
        await Router.push('/')
      }
    })()
  }, [])

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
