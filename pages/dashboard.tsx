import { Button } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { UserProjects } from '../components/projects/UserProjects'
import { withApollo } from '../src/apollo'

function DashboardPage() {
  return (
    <>
      <Head>
        <title>ChainJet Dashboard</title>
      </Head>
      <PageWrapper title="Dashboard">
        <div style={{ marginBottom: 16 }}>
          <Link href="/create/workfow">
            <Button type="primary">Create Workflow</Button>
          </Link>
        </div>
        <UserProjects />
      </PageWrapper>
    </>
  )
}

export default withApollo(DashboardPage)
