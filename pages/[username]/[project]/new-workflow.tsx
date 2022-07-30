import React, { useState } from 'react'
import { withApollo } from '../../../src/apollo'
import { Alert, Button, Card, Col, Form, Input, Row } from 'antd'
import { Store } from 'rc-field-form/es/interface'
import Router from 'next/router'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { useCreateOneWorkflow } from '../../../src/services/WorkflowHooks'
import { gql } from '@apollo/client'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { NextPageContext } from 'next'
import { RequestError } from '../../../components/common/RequestStates/RequestError'
import { useGetProjects } from '../../../src/services/ProjectHooks'
import { slugify } from '../../../src/utils/strings'
import { getQueryParam } from '../../../src/utils/nextUtils'
import Head from 'next/head'

const projectFragment = gql`
  fragment NewWorkflowPage on Project {
    id
    slug
  }
`

interface Props {
  username: string
  projectName: string
}

function NewWorkflowPage (props: Props) {
  const projectRes = useGetProjects(projectFragment, {
    variables: {
      filter: {
        slug: {
          eq: `${props.username}/${props.projectName}`.toLowerCase()
        }
      }
    }
  })
  const [form] = Form.useForm()
  const [createWorkflow] = useCreateOneWorkflow()
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')

  if (projectRes.loading) {
    return <Loading />
  }
  if (projectRes.error || !projectRes.data?.projects?.edges?.[0]?.node) {
    return <RequestError error={projectRes.error} />
  }

  const project = projectRes.data.projects.edges[0].node

  const onFinish = async (values: Store) => {
    try {
      const workflowRes = await createWorkflow({
        variables: {
          input: {
            workflow: {
              project: project.id,
              name: values.name
            }
          }
        }
      })
      const workflowSlug = workflowRes.data?.createOneWorkflow?.slug
      if (workflowSlug) {
        await Router.push('/[username]/[project]/workflow/[workflow]', `/${workflowSlug}`)
      } else {
        setFormError('Unexpected error, please try again')
      }
    } catch (e) {
      setFormError(e.message)
    }
  }

  const handleGoBack = async () => {
    await Router.push('/[username]/[project]', `/${project.slug}`)
  }

  return (
    <>
      <Head>
        <title>Create a new workflow on ChainJet</title>
      </Head>

      <PageWrapper
        title="Create workflow"
        subTitle="A workflow defines a set of operations to be executed."
        onBack={handleGoBack}>
        <Row gutter={24}>
          <Col xs={24}>
            {
              formError && <Alert
                message="Error"
                description={formError}
                type="error"
                showIcon
                closable
              />
            }
            <Card>
              <Form form={form} name="create-workflow" onFinish={onFinish}>
                <Form.Item name="name"
                  label="Workflow Name"
                  rules={[{ required: true }]}
                  help={name && `https://chainjet.io/${project.slug}/workflow/${slugify(name)}`}>
                  <Input allowClear onChange={e => setName(e.target.value)} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageWrapper>
    </>
  )
}

NewWorkflowPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    username: getQueryParam(ctx, 'username').toLowerCase(),
    projectName: getQueryParam(ctx, 'project').toLowerCase()
  }
}

export default withApollo(NewWorkflowPage)
