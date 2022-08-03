import Head from 'next/head'
import React from 'react'
import { withApollo } from '../../src/apollo'
import { IntegrationPageContainer } from '../../components/integrations/IntegrationsPageContainer'
import { getHeadMetatags } from '../../src/utils/html.utils'

function IntegrationsPage() {
  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/integrations',
          title: 'ChainJet Integrations',
          description: 'List of integrations for ChainJet.',
        })}
      </Head>
      <IntegrationPageContainer />
    </>
  )
}

export default withApollo(IntegrationsPage, { useLayout: false })
