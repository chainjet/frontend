import { Alert, Button, Card, Col, Form, Input, Row } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Store } from 'rc-field-form/es/interface'
import { useState } from 'react'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { withApollo } from '../../src/apollo'
import { AnalyticsService } from '../../src/services/AnalyticsService'
import { useCreateOneWorkflow } from '../../src/services/WorkflowHooks'

/**
 * @deprecated
 */
function NewWorkflowPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [createWorkflow] = useCreateOneWorkflow()
  const [formError, setFormError] = useState('')

  const onFinish = async (values: Store) => {
    try {
      const workflowRes = await createWorkflow({
        variables: {
          input: {
            workflow: {
              name: values.name,
            },
          },
        },
      })
      const workflowId = workflowRes.data?.createOneWorkflow?.id
      if (workflowId) {
        AnalyticsService.sendEvent({ action: 'new_workflow', label: 'create_workflow', category: 'engagement' })
        await router.push(`/workflows/${workflowId}`)
      } else {
        setFormError('Unexpected error, please try again')
      }
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  const handleGoBack = async () => {
    await router.push('/dashboard')
  }

  return (
    <>
      <Head>
        <title>Create a new workflow on ChainJet</title>
      </Head>

      <PageWrapper
        title="Create workflow"
        subTitle="A workflow defines a set of operations to be executed."
        onBack={handleGoBack}
      >
        <Row gutter={24}>
          <Col xs={24}>
            {formError && <Alert message="Error" description={formError} type="error" showIcon closable />}
            <Card>
              <Form form={form} name="create-workflow" onFinish={onFinish}>
                <Form.Item name="name" label="Workflow Name" rules={[{ required: true }]}>
                  <Input allowClear />
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

export default withApollo(NewWorkflowPage)
