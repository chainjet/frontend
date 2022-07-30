import { gql } from '@apollo/client';
import { Button, Card } from 'antd';
import { NextPageContext } from 'next';
import Router from 'next/router';
import React, { useEffect, useState } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { DeleteProjectModal } from '../../../components/projects/DeleteProjectModal';
import { ProjectForm } from '../../../components/projects/ProjectForm';
import { Loading } from '../../../components/common/RequestStates/Loading';
import { RequestError } from '../../../components/common/RequestStates/RequestError';
import { Project } from '../../../graphql';
import { withApollo } from "../../../src/apollo";
import { useGetProjects, useUpdateOneProject } from '../../../src/services/ProjectHooks';
import { getQueryParam } from '../../../src/utils/nextUtils';
import Head from 'next/head';

const projectFragment = gql`
  fragment ProjectSettingsPage on Project {
    id
    name
    slug
  }
`

interface Props {
  username: string
  projectName: string
}

function ProjectSettingsPage (props: Props) {
  const projectSlug = `${props.username}/${props.projectName}`
  const { data, loading, error } = useGetProjects(projectFragment, {
    variables: {
      filter: {
        slug: { eq: projectSlug }
      }
    }
  })
  const [project, setProject] = useState<Project | undefined>(data?.projects.edges[0].node)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateProject] = useUpdateOneProject()
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)

  useEffect(() => {
    setProject((data?.projects.edges[0].node))
  }, [data])

  if (loading) {
    return <Loading />
  }
  if (error || !project) {
    return <RequestError error={error} />
  }

  const handleProjectChange = (key: keyof Project, value: any) => {
    setProject({
      ...project,
      [key]: value
    })
  }

  const handleProjectUpdate = async (update: Partial<Project>) => {
    setUpdateLoading(true)
    try {
      const res = await updateProject({
        variables: {
          input: {
            id: project.id,
            update: {
              name: update.name
            },
          }
        }
      })
      await Router.push('/[username]/[project]', `/${res.data?.updateOneProject.slug}`)
    } catch (e) {
      setUpdateError(e.message)
    }
    setUpdateLoading(false)
  }

  const handleProjectDelete = async () => {
    await Router.push('/')
  }

  const handleGoBack = async () => {
    await Router.push('/[username]/[project]', `/${projectSlug}`)
  }

  return (
    <>
      <Head>
        <title>{project.name} Settings - ChainJet</title>
      </Head>

      <PageWrapper title={`Update project "${project.name}" settings`}
        onBack={handleGoBack}>

        <Card>
          <ProjectForm project={project}
            showSubmit={true}
            onChange={handleProjectChange}
            onSubmit={handleProjectUpdate}
            loading={updateLoading}
            error={updateError} />
        </Card>

        <Card title="Danger settings" style={{ marginTop: 24, border: '1px solid #d40000' }}>
          <Button type="primary" danger onClick={() => setDeleteProjectModalOpen(true)}>Delete project</Button>
        </Card>

        <DeleteProjectModal visible={deleteProjectModalOpen}
          project={project}
          onDeleteProject={handleProjectDelete}
          onCancel={() => setDeleteProjectModalOpen(false)} />
      </PageWrapper>
    </>
  )
}

ProjectSettingsPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    username: getQueryParam(ctx, 'username').toLowerCase(),
    projectName: getQueryParam(ctx, 'project').toLowerCase()
  }
}

export default withApollo(ProjectSettingsPage)
