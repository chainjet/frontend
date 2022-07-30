import React from 'react'
import { withApollo } from '../../../src/apollo'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { gql } from '@apollo/client'
import { NextPageContext } from 'next'
import { Button } from 'antd'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { ProjectWorkflows } from '../../../components/workflows/ProjectWorkflows'
import Link from 'next/link'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { useGetProjects } from '../../../src/services/ProjectHooks'
import Router from 'next/router'
import { SettingOutlined } from '@ant-design/icons'
import { getQueryParam } from '../../../src/utils/nextUtils'
import Head from 'next/head'

const projectFragment = gql`
  fragment ProjectPage on Project {
    id
    name
    slug
    ...ProjectWorkflows_Project
  }
  ${ProjectWorkflows.fragments.Project}
`

interface Props {
  username: string
  projectName: string
}

function ProjectPage (props: Props) {
  const projectSlug = `${props.username}/${props.projectName}`.toLowerCase()
  const { data, loading, error } = useGetProjects(projectFragment, {
    variables: {
      filter: {
        slug: { eq: projectSlug }
      }
    }
  })

  if (loading) {
    return <Loading/>
  }
  if (error || !data?.projects?.edges?.[0]?.node) {
    return <RequestError error={error}/>
  }

  const project = data.projects.edges[0].node

  const handleGoBack = async () => {
    await Router.push('/')
  }

  const handleSettingsClick = async () => {
    await Router.push('/[username]/[project]/settings', `/${project.slug}/settings`,)
  }

  return (
    <>
      <Head>
        <title>{project.name}</title>
      </Head>

      <PageWrapper title={project.name}
                   onBack={handleGoBack}
                   extra={[
                    <Button
                      key="settings"
                      onClick={handleSettingsClick}
                      icon={<SettingOutlined />}>
                        Settings
                      </Button>
                    ]}>

        <div style={{ marginBottom: 16 }}>
          <Link href="/[username]/[project]/new-workflow" as={`/${project.slug}/new-workflow`}>
            <Button type="primary">Create Workflow</Button>
          </Link>
        </div>
        <ProjectWorkflows project={project}/>
      </PageWrapper>
    </>
  )
}

ProjectPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    username: getQueryParam(ctx, 'username').toLowerCase(),
    projectName: getQueryParam(ctx, 'project').toLowerCase()
  }
}

export default withApollo(ProjectPage)
