import { Button } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { UserProjects } from '../components/projects/UserProjects'
import { withApollo } from '../src/apollo'
import { useRedirectGuests } from '../src/services/UserHooks'

function HomePage() {
  const { viewer } = useRedirectGuests()

  if (!viewer) {
    return <></>
  }

  return (
    <>
      <Head>
        <title>ChainJet Projects</title>
      </Head>
      <PageWrapper title="Projects">
        <div style={{ marginBottom: 16 }}>
          <Link href="/new">
            <Button type="primary">Create Project</Button>
          </Link>
        </div>
        <UserProjects />
      </PageWrapper>
    </>
  )
}

export default withApollo(HomePage)
