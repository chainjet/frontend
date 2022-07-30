import React from 'react'
import { Button } from 'antd'
import Link from 'next/link'
import Head from 'next/head'
import { withApollo } from '../src/apollo'
import { UserProjects } from '../components/projects/UserProjects'
import { useViewer } from '../src/services/UserHooks'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import Landing from '../components/landing/generated'
import { getHeadMetatags } from '../src/utils/html.utils'
import { LandingHeader } from '../components/landing/LandingHeader'

function HomePage () {
  const { viewer } = useViewer()

  if (!viewer) {
    return (
      <>
        <Head>
          {
            getHeadMetatags({
              path: '/',
              title: 'ChainJet - No-Code Blockchain Workflow Automation',
              description: 'Connect over 300 integrations to automate your routine and unlock your business potential.'
            })
          }
        </Head>
        <LandingHeader />
        <Landing />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>ChainJet Projects</title>
      </Head>
      <PageWrapper title="Projects">
        <div style={{ marginBottom: 16 }}>
          <Link href="/new"><Button type="primary">Create Project</Button></Link>
        </div>
        <UserProjects />
      </PageWrapper>
    </>
  )
}

export default withApollo(HomePage)
