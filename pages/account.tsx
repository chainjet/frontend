import { Button } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { UserWorkflows } from '../components/workflows/UserWorkflows'
import { withApollo } from '../src/apollo'
import { useRedirectGuests } from '../src/services/UserHooks'

function HomePage() {
  const { signer } = useRedirectGuests()

  if (!signer) {
    return <></>
  }

  return (
    <>
      <Head>
        <title>ChainJet Dashboard</title>
      </Head>
      <PageWrapper title="Workflows">
        <div style={{ marginBottom: 16 }}>
          <Link href="/create/workflow">
            <Button type="primary">Create Workflow</Button>
          </Link>
        </div>
        <UserWorkflows />
      </PageWrapper>
    </>
  )
}

export default withApollo(HomePage)
