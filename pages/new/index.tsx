import React, { useState } from 'react'
import { withApollo } from '../../src/apollo'
import { Card, Col, Row } from 'antd'
import { Store } from 'rc-field-form/es/interface'
import { useCreateOneProject } from '../../src/services/ProjectHooks'
import Router from 'next/router'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { ProjectForm } from '../../components/projects/ProjectForm'
import Head from 'next/head'

function NewProjectPage() {
  const [createProject] = useCreateOneProject()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateProject = async (values: Store) => {
    try {
      const project = await createProject({
        variables: {
          input: {
            project: {
              name: values.name,
              public: false,
            },
          },
        },
      })
      const projectSlug = project.data?.createOneProject?.slug
      if (projectSlug) {
        await Router.push('/[username]/[project]', `/${projectSlug}`)
      } else {
        setError('Unexpected error, please try again')
      }
    } catch (e: any) {
      setError(e?.message)
    }
  }

  const handleGoBack = async () => {
    await Router.push('/')
  }

  return (
    <>
      <Head>
        <title>Create a new project - ChainJet</title>
      </Head>
      <PageWrapper title="New Project" subTitle="A project can contain multiple workflows." onBack={handleGoBack}>
        <Row gutter={24}>
          <Col xs={24}>
            <Card>
              <ProjectForm showSubmit={true} onSubmit={handleCreateProject} error={error} />
            </Card>
          </Col>
        </Row>
      </PageWrapper>
    </>
  )
}

export default withApollo(NewProjectPage)
