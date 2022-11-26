import { CloseOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Alert, Button, Card } from 'antd'
import { JSONSchema7 } from 'json-schema'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { SchemaForm } from '../../components/common/Forms/schema-form/SchemaForm'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { IntegrationAvatar } from '../../components/integrations/IntegrationAvatar'
import { WorkflowNodeDrawer } from '../../components/workflow-nodes/drawer/WorkflowNodeDrawer'
import { IntegrationAction } from '../../graphql'
import { withApollo } from '../../src/apollo'
import { useGetIntegrationActionById } from '../../src/services/IntegrationActionHooks'
import { useCreateWorkflowWithOperations } from '../../src/services/WizardHooks'

const integrationActionFragment = gql`
  fragment NewSchedulePageFragment on IntegrationAction {
    id
    key
    name
    integration {
      id
      key
      name
      logo
    }
  }
`

function NewSchedulePage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [datetime, setDatetime] = useState<string | null>(null)
  const [action, setAction] = useState<{
    inputs: Record<string, any>
    integrationAction: IntegrationAction
    credentialsID?: string
  } | null>(null)
  const {
    createWorflowWithOperations,
    workflow,
    workflowActions,
    error: createError,
  } = useCreateWorkflowWithOperations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const integrationActionRes = useGetIntegrationActionById(integrationActionFragment, {
    skip: !action,
    variables: {
      id: action?.integrationAction.id ?? '',
    },
  })
  const integrationAction = integrationActionRes?.data?.integrationAction
  const integrationActionLoading = integrationActionRes?.loading

  useEffect(() => {
    if (workflow && workflowActions) {
      router.push(`/workflows/${workflow.id}`)
    }
  }, [router, workflow, workflowActions])

  const handleSelectAction = async (
    inputs: Record<string, any>,
    integrationAction: IntegrationAction,
    credentialsID?: string,
  ) => {
    setAction({
      inputs,
      integrationAction,
      credentialsID,
    })
    setDrawerOpen(false)
  }

  const handleScheduleSet = (inputs: Record<string, any>) => {
    if (Date.now() > new Date(inputs.datetime).getTime()) {
      setError(new Error('Date must be in the future'))
      return
    }
    setError(null)
    setDatetime(inputs.datetime)
  }

  const handleScheduleTask = async () => {
    if (!datetime || !action || !integrationAction) {
      return
    }
    try {
      setLoading(true) // keep it loading until redirect
      await createWorflowWithOperations({
        workflowName: `${integrationAction.name} on ${integrationAction.integration.name}`,
        triggerIntegration: {
          key: 'schedule',
          version: '1',
        },
        trigger: {
          key: 'schedule',
          inputs: {},
          schedule: {
            frequency: 'once',
            datetime,
          },
          name: 'One-time run',
        },
        actions: [
          {
            key: integrationAction.key,
            inputs: action.inputs,
            credentialsId: action.credentialsID,
          },
        ],
      })
    } catch (e: any) {
      setLoading(false)
      setError(e)
    }
  }

  const handleGoBack = async () => {
    await router.push('/dashboard')
  }

  const schema: JSONSchema7 = {
    type: 'object',
    required: ['datetime'],
    properties: {
      datetime: {
        title: 'When should it run?',
        type: 'string',
        format: 'date-time',
      },
    },
  }

  return (
    <>
      <Head>
        <title>Schedule a new task</title>
      </Head>

      <PageWrapper title="Schedule a one-time task" onBack={handleGoBack}>
        <div className="container max-w-4xl px-0 mx-auto">
          <Card>
            {!integrationAction && (
              <div className="mb-8">
                <Button type="primary" onClick={() => setDrawerOpen(true)} loading={integrationActionLoading}>
                  Select Task
                </Button>
              </div>
            )}
            {integrationAction && (
              <div className="flex items-center gap-2 mb-8">
                <div>
                  <IntegrationAvatar integration={integrationAction.integration} />
                </div>
                <div>
                  <span className="font-bold">{integrationAction.name}</span>
                </div>
                <div>
                  <span className="text-red-600 cursor-pointer" onClick={() => setAction(null)}>
                    <CloseOutlined />
                  </span>
                </div>
              </div>
            )}
            <div className="mb-4">
              <SchemaForm
                schema={schema}
                initialInputs={{ datetime }}
                onChange={handleScheduleSet}
                onSubmit={() => {}}
                hideSubmit
              />
            </div>
            {(error || createError) && (
              <div className="mb-8">
                <Alert message="Error" description={error?.message || createError} type="error" showIcon closable />
              </div>
            )}
            <Button type="primary" onClick={handleScheduleTask} loading={loading} disabled={!action || !datetime}>
              Schedule Task
            </Button>
            {drawerOpen && (
              <WorkflowNodeDrawer
                nodeType="action"
                title="Create Workflow Action"
                visible={drawerOpen}
                action="create"
                workflowTriggerId={undefined}
                parentActionIds={[]}
                onSubmitInputs={handleSelectAction}
                onCancel={() => setDrawerOpen(false)}
              />
            )}
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(NewSchedulePage)
