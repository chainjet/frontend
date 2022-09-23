import { Button } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'

function DashboardPage() {
  return (
    <>
      <Head>
        <title>ChainJet Dashboard</title>
      </Head>
      <PageWrapper title="Dashboard">
        <div style={{ marginBottom: 16 }}>
          <Link href="/create/workflow">
            <Button type="primary">Create Workflow</Button>
          </Link>
        </div>
      </PageWrapper>
    </>
  )
}

export default DashboardPage
