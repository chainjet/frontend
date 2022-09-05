import { gql } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { Workflow, WorkflowAction } from '../../graphql'
import { useGetIntegrationActions } from './IntegrationActionHooks'
import { useGetIntegrations } from './IntegrationHooks'
import { useGetIntegrationTriggers } from './IntegrationTriggerHooks'
import { useCreateOneWorkflowAction } from './WorkflowActionHooks'
import { useCreateOneWorkflow } from './WorkflowHooks'
import { useCreateOneWorkflowTrigger } from './WorkflowTriggerHooks'

type OperationData = {
  key: string
  inputs: Record<string, any>
  credentialsId?: string
}

type TriggerData = OperationData & { schedule?: Record<string, any> }

interface CreateWorkflowWithOperations {
  projectId: string
  workflowName: string
  integration: {
    id?: string
    key: string
    version?: string
  }
  trigger: TriggerData
  actions: Array<OperationData>
}

const integrationFragment = gql`
  fragment WizardHookIntegrationFragment on Integration {
    id
    key
  }
`

const integrationTriggerFragment = gql`
  fragment WizardHookIntegrationTriggerFragment on IntegrationTrigger {
    id
    key
  }
`

const integrationActionFragment = gql`
  fragment WizardHookIntegrationActionFragment on IntegrationAction {
    id
    key
  }
`

export function useCreateWorkflowWithOperations() {
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<TriggerData>()
  const [actions, setActions] = useState<Array<OperationData>>()
  const [integrationQuery, setIntegrationQuery] = useState<{ id?: string; key: string; version?: string }>()
  const [workflow, setWorkflow] = useState<Workflow>()
  const [workflowActions, setWorkflowActions] = useState<WorkflowAction[]>()
  const [createWorkflow] = useCreateOneWorkflow()
  const [createWorkflowTrigger] = useCreateOneWorkflowTrigger()
  const [createWorkflowAction] = useCreateOneWorkflowAction()

  const idFilter = { id: { eq: integrationQuery?.id } }
  const keyFilter = {
    key: { eq: integrationQuery?.key },
    ...(integrationQuery?.version ? { version: { eq: integrationQuery?.version } } : {}),
  }
  const { data: integrationData, loading: integrationLoading } = useGetIntegrations(integrationFragment, {
    skip: !integrationQuery?.id && !integrationQuery?.key,
    variables: {
      filter: integrationQuery?.id ? idFilter : keyFilter,
    },
  })
  const integration = integrationData?.integrations?.edges?.[0]?.node

  const { data: integrationTriggerData, loading: integrationTriggerLoading } = useGetIntegrationTriggers(
    integrationTriggerFragment,
    {
      skip: !integration?.id,
      variables: {
        filter: {
          integration: { eq: integration?.id },
          key: { eq: trigger?.key },
        },
      },
    },
  )
  const integrationTrigger = integrationTriggerData?.integrationTriggers?.edges?.[0]?.node

  const { data: integrationActionsData, loading: integrationActionsLoading } = useGetIntegrationActions(
    integrationActionFragment,
    {
      skip: !actions?.length || !actions[0]?.key,
      variables: {
        filter: {
          key: { in: actions?.map((action) => action.key) },
        },
      },
    },
  )
  const integrationActions = integrationActionsData?.integrationActions?.edges?.map((edge) => edge.node)

  const dataLoading = integrationLoading || integrationTriggerLoading || integrationActionsLoading

  const createWorflowWithOperations = useCallback(
    async ({ projectId, workflowName, integration, trigger, actions }: CreateWorkflowWithOperations) => {
      setLoading(true)
      setIntegrationQuery(integration)
      setTrigger(trigger)
      setActions(actions)
      const workflowRes = await createWorkflow({
        variables: {
          input: {
            workflow: {
              project: projectId,
              name: workflowName,
            },
          },
        },
      })
      setWorkflow(workflowRes.data?.createOneWorkflow)
    },
    [createWorkflow],
  )

  useEffect(() => {
    const run = async () => {
      if (running || dataLoading || !integrationTrigger || !workflow || !trigger || !actions) {
        return
      }
      if (!integrationTrigger) {
        setLoading(false)
        setError(`Integration trigger not found`)
        return
      }
      setRunning(true)

      const workflowTriggerRes = await createWorkflowTrigger({
        variables: {
          input: {
            workflowTrigger: {
              workflow: workflow.id,
              integrationTrigger: integrationTrigger.id,
              inputs: trigger.inputs,
              credentials: trigger.credentialsId,
              schedule: trigger.schedule,
            },
          },
        },
      })

      // TODO support multiple actions
      if (integrationActions?.length) {
        const workflowActionRes = await createWorkflowAction({
          variables: {
            input: {
              workflowAction: {
                workflow: workflow.id,
                integrationAction: integrationActions[0].id,
                inputs: actions[0].inputs,
                credentials: actions[0].credentialsId,
              },
            },
          },
        })
        if (workflowActionRes.data?.createOneWorkflowAction) {
          setWorkflowActions([workflowActionRes.data.createOneWorkflowAction])
        }
      }

      setLoading(false)
      setRunning(false)
    }

    run()
  }, [
    running,
    workflow,
    integrationTrigger,
    integrationActions,
    createWorkflowTrigger,
    createWorkflowAction,
    trigger,
    actions,
    dataLoading,
  ])

  return {
    createWorflowWithOperations,
    workflow,
    workflowActions,
    loading,
    error,
  }
}