import Head from 'next/head'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { PricingTable } from '../components/users/PricingTable'
import { withApollo } from '../src/apollo'

function PricingPage() {
  return (
    <>
      <Head>
        <title>ChainJet Dashboard</title>
      </Head>
      <PageWrapper>
        <PricingTable />
      </PageWrapper>
    </>
  )
}

export default withApollo(PricingPage)
