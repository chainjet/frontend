import React from 'react'
import { withApollo } from '../../src/apollo'
import { SignTabs } from '../../components/users/SignTabs'
import Head from 'next/head'
import { getHeadMetatags } from '../../src/utils/html.utils'

const RegisterPage = () => {
  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/register',
          title: 'ChainJet - Register',
          description: 'Start using ChainJet for free.',
        })}
      </Head>
      <SignTabs defaultTabKey="register" />
    </>
  )
}

export default withApollo(RegisterPage, { useLayout: false })
