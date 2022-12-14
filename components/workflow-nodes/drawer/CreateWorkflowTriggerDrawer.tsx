import { useState } from 'react'
import { IntegrationTrigger, WorkflowTrigger } from '../../../graphql'
import { useCreateOneWorkflowTrigger } from '../../../src/services/WorkflowTriggerHooks'
import { CompleteHookTrigger } from './steps/CompleteHookTrigger'
import { WorkflowNodeDrawer } from './WorkflowNodeDrawer'

interface Props {
  workflowId: string
  visible: boolean
  onCreateWorkflowTrigger: (workflowTrigger: WorkflowTrigger) => void
  onCancel: () => void
}

export const CreateWorkflowTriggerDrawer = ({ workflowId, visible, onCreateWorkflowTrigger, onCancel }: Props) => {
  const [createWorkflowTrigger] = useCreateOneWorkflowTrigger()
  const [hookStep, setHookStep] = useState(false)
  const [integrationTrigger, setIntegrationTrigger] = useState<IntegrationTrigger | null>(null)
  const [workflowTrigger, setWorkflowTrigger] = useState<WorkflowTrigger | null>(null)

  const onSubmitInputs = async (
    inputs: Record<string, any>,
    integrationTrigger: IntegrationTrigger,
    credentialsID?: string,
  ) => {
    // directly modifying inputs causes the component to re-render and display old values for a moment before saving
    const newInputs = { ...inputs }

    let schedule
    if (newInputs.chainjet_poll_interval) {
      schedule = {
        frequency: 'interval',
        interval: newInputs.chainjet_poll_interval,
      }
      delete newInputs.chainjet_poll_interval
    } else {
      schedule = newInputs.chainjet_schedule
      delete newInputs.chainjet_schedule
    }
    const res = await createWorkflowTrigger({
      variables: {
        input: {
          workflowTrigger: {
            workflow: workflowId,
            integrationTrigger: integrationTrigger.id,
            inputs: newInputs,
            credentials: credentialsID,
            schedule,
          },
        },
      },
    })
    setIntegrationTrigger(integrationTrigger)
    if (res.data?.createOneWorkflowTrigger) {
      setWorkflowTrigger(res.data?.createOneWorkflowTrigger)
      if (res.data.createOneWorkflowTrigger.hookId && integrationTrigger.key === 'receiveWebhook') {
        setHookStep(true)
      } else {
        onCreateWorkflowTrigger(res.data.createOneWorkflowTrigger)
      }
    }
  }

  const handleCancel = () => {
    // if the workflow trigger was updated and the drawer is opened on the override step, complete on cancel
    if (workflowTrigger) {
      onCreateWorkflowTrigger(workflowTrigger)
    } else {
      onCancel()
    }
  }

  const handleCompleteHooKTrigger = () => {
    if (workflowTrigger) {
      onCreateWorkflowTrigger(workflowTrigger)
    }
  }

  return (
    <WorkflowNodeDrawer
      nodeType="trigger"
      title="Create Workflow Trigger"
      visible={visible}
      action="create"
      overrideStep={
        integrationTrigger && workflowTrigger && hookStep ? (
          <CompleteHookTrigger
            integrationTrigger={integrationTrigger}
            workflowTrigger={workflowTrigger}
            onClose={handleCompleteHooKTrigger}
          />
        ) : undefined
      }
      onSubmitInputs={onSubmitInputs}
      onCancel={handleCancel}
    />
  )
}
