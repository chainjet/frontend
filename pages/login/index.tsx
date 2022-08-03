import React from 'react'
import { withApollo } from '../../src/apollo'
import { SignTabs } from '../../components/users/SignTabs'
import { NextPageContext } from 'next'
import { getQueryParam } from '../../src/utils/nextUtils'
import Head from 'next/head'
import { getHeadMetatags } from '../../src/utils/html.utils'

interface Props {
  passwordChanged: boolean
}

const LoginPage = (props: Props) => {
  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/login',
          title: 'ChainJet - Login',
          description: 'Login into ChainJet',
        })}
      </Head>
      <SignTabs defaultTabKey="login" passwordChanged={props.passwordChanged} />
    </>
  )
}

LoginPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    passwordChanged: !!getQueryParam(ctx, 'password-changed'),
  }
}

export default withApollo(LoginPage, { useLayout: false })
